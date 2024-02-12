import config from "config";
import store from 'store';
import { setMessage } from 'store/reducers/message';

class WebSocketClient extends EventTarget {
    constructor() {
        super();
        this.connection = null;
        this.isOnline = true
    }

    restartConnection = async () => {
        this.close();
        window.removeEventListener("offline", () => { });
        window.removeEventListener("online", () => { });
        console.log("restartConnection1")
        const enteredIntoEvent = store.getState()?.game?.enteredIntoEvent;
        if (!enteredIntoEvent && this.isOnline) {
        console.log("restartConnection2")
            try {
                await this.startConnection();
                if (window.enter_world_clicked) {
        console.log("restartConnection3")
                    const userCurrent = store.getState()?.user?.current || null
                    if (userCurrent) {
                        const data = {
                            event_name: config.event.name,
                            user_id: userCurrent.id,
                            email: userCurrent.email
                        }
                        this.startSession(data)
                    }
                }
            } catch (error) {
        console.log("restartConnection4")
                console.log(error)
            }
        }
    }

    startConnection = async () => {
        return new Promise(async(resolve) => {
            const url = window.useDevServices ? `${config.awsWebsocket.dev_url}/${config.awsWebsocket.dev_stage}` : `${config.awsWebsocket.url}/${config.awsWebsocket.stage}`
            this.connection = new WebSocket(`wss://${url}`);
            this.addListeners((type) => {
                console.log(type)
                resolve(type)
            })
        })
    }

    addListeners = (callback) => {
        window.addEventListener("online", () => {
            this.isOnline = true;
        })
        window.addEventListener("offline", () => {
            this.isOnline = false
            store.dispatch(
                setMessage({
                    message: "You went offline. Please refresh your browser once you back to online",
                    timeout: -1,
                })
            );
        })
        this.connection.addEventListener('open', (event) => {
            console.info('Lambda Socket Connected to Server Successfully');
            console.log(event, this.connection)
            if (callback) {
                callback(event.type)
            }
        });

        this.connection.addEventListener('message', async (event) => {

            const body = JSON.parse(event.data);

            console.log(body, "WS Response")

            switch (body.type) {
                case "startsession_ready": {
                    this.triggerEvent("startsession_ready", body.payload)
                    break;
                }

                case "startsession_waking": {
                    this.triggerEvent("startsession_waking", body.payload);
                    break;
                }

                case "startsession_hang_tight": {
                    this.triggerEvent("startsession_hang_tight", body.payload)
                    break;
                }

                case "startsession_noserver": {
                    this.triggerEvent("startsession_noserver", body.payload)
                    break;
                }

                case "startsession_error": {
                    this.triggerEvent("startsession_error", body.payload);
                    setTimeout(async()=>{
                        await this.restartConnection();
                    },2000)
                    break;
                }

                case "startsession_terminated": {
                    this.triggerEvent("startsession_terminated", body.payload);
                    setTimeout(async()=>{
                        await this.restartConnection();
                    },2000)
                    break;
                }

                case "startsession_reloadpage" : {
                   window.location.reload()
                    break;
                }

                case "startsession_duplicate": {
                    this.triggerEvent("startsession_duplicate", body.payload)
                    this.close();
                    break;
                }

                case "startsession_ec2_error": {
                    this.triggerEvent("startsession_ec2_error", body.payload)
                    break;
                }

                case "startsession_validation_error": {
                    break;
                }

                default: {
                    break;
                }
            }
            console.log(event)
        });

        this.connection.addEventListener('error', async (event) => {
            console.log('WebSocket error: ', event);
            await this.restartConnection();
        });
    }

    startSession = (body) => {
        const dataToSend = {
            "type": "requestinstance",
            "message": body
        }
        console.log("DATA TO SEND", dataToSend)
        console.log(this.connection, "<<<this.connection")
        this.connection.send(JSON.stringify(dataToSend))
    }

    setAvailable = () => {
        const dataToSend = {
            "type": "setinstanceavailable",
            "message": {}
        }
        console.log("<<<setAvailable")
        this.connection.send(JSON.stringify(dataToSend))
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
       this.connection?.close()
    }

}

const webSocketClient = new WebSocketClient();

export default webSocketClient
