import config from "config";
// import store from 'store';
import { setMessage } from 'store/reducers/message';
import { StorageService } from "services";

const storageService = new StorageService()

class VCWebSocketClient extends EventTarget {
    constructor() {
        super();
        this.connection = null;
    }

    restartConnection = async () => {
        this.close();
        try {
            await this.startConnection();
        } catch (error) {
            console.log(error)
        }
    }

    startConnection = async () => {
        return new Promise(async(resolve) => {
            const url = config.api.xpManagerBaseURL
            var sockJsURL = new SockJS('http://qabuild.surrealevents.com:8080' + '/ws-agendas');
            this.connection = await Stomp.over(sockJsURL)
            this.addListeners((frame) => {
                console.log("FRAMEE", frame)
                resolve(frame?.command)
            })
        })
    }

    onRaiseHand = (payload) => {
        this.triggerEvent("virtual_classroom_raise_hand", payload)
    }

    addListeners = (callback) => {
        //Assigning attributes to local variables for readability
        let stompClient = this.connection
        let emitMessageEvent = this.emitMessageEvent

        //Add current agenda and current agendaRole for current user after TMS works
        // const currAgendaId = store.getState()?.agenda?.current;
        // const currAgendaRole = store.getState()?.agenda?.role;

        const currAgendaRole = "TRAINEE"
        const currAgendaId = "108"
        const xpToken = storageService.getXPToken()
        if(xpToken){
            const headers = {
                "Authorization": "Bearer " + xpToken
            }
    
            stompClient.connect(headers, async (frame) => {
                console.log('Connected: ' + frame);
                //Common Topics
                //Raise Hand websocket subscription for all participants
                stompClient.subscribe(`/ws-agendas/${currAgendaId}/raise-hand`, (message) => {
                    this.onRaiseHand(message.body)
                });
                if (callback) {
                    callback(frame)
                }
            }, async (error) => {
                console.log('WebSocket error: ', error);
                await this.restartConnection();
            });

        }else{
            throw new Error("Auth token not found, connection to websocket channel failed")
        }
    }

    on = (event, handler) => {
        this.addEventListener(event, (e) => {
            if (handler) {
                handler(e.detail);
            }
        });
    };

    triggerEvent = (name, payload) => {
        this.dispatchEvent(new CustomEvent(name, { detail: payload }));
    };

    close =() => {
        let stompClient = this.connection
        try{
            stompClient?.disconnect()
        }catch(error){
            console.log("ERROR DISCONNECTING STOMP CLIENT", error)
        }
    }

}

const vcWebSocketClient = new VCWebSocketClient();

export default vcWebSocketClient
