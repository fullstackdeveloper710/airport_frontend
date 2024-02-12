import BaseAPIService from './baseAPIService';

class ClassroomService extends BaseAPIService {

    // Polls services
    createPoll = (agendaId, payload) => {
        return this.requestXPManager(`/agendas/${agendaId}/polls`, 'POST', payload);
    };
    getPollsByAgenda = (agendaId) => {
        return this.requestXPManager(`/agendas/${agendaId}/polls`, 'GET');
        // return this.requestXPManager(`/surreal-sub-experiences/1/agenda/${agendaId}`, 'GET');
    };
    getPollSubmitStatus = (agendaId,pollId)=> {
        return this.requestXPManager(`/agendas/${agendaId}/polls/${pollId}/user-poll-opinion`, 'GET');
    }
    updatePollStatus = (agendaId,pollId,pollStatus)=>{
        return this.requestXPManager(`/agendas/${agendaId}/polls/${pollId}/status`, 'PUT',{pollStatus});
    }
    getPollsResults = (agendaId,pollId) => {
            return this.requestXPManager(`/agendas/${agendaId}/polls/${pollId}/results`, 'GET');
    }


    getQuizzesByAgenda = (programId,agendaId) => {
        // return this.requestXPManager(`/agendas/${agendaId}/polls`, 'GET');
        return this.requestXPManager(`/programs/${programId}/quizzes/quiz-load?agenda-id=${agendaId}`, 'GET');
    };
    getProgramQuizzes = (programId) => {
        return this.requestXPManager(`/programs/${programId}/quizzes`, 'GET');
    }
    loadQuiz = (programId,quizId,agendaId) => {
        return this.requestXPManager(`/programs/${programId}/quizzes/${quizId}/load-quiz`, 'POST',{agendaId});
    }
    getQuizSubmitStatus = (programId,quizId,quizLoadId) => {
        return this.requestXPManager(`/programs/${programId}/quizzes/${quizId}/quiz-load/${quizLoadId}/user-quiz-answer`, 'GET');
    }
    updateQuizLoadStatus = (programId,quizId,quizLoadId,quizLoadStatus)=>{
        return this.requestXPManager(`/programs/${programId}/quizzes/${quizId}/quiz-load/${quizLoadId}/status`, 'PUT',{quizLoadStatus});
    }
    getQuizResults = (programId,quizId,quizLoadId)=>{
        return this.requestXPManager(`/programs/${programId}/quizzes/${quizId}/quiz-load/${quizLoadId}/results`, 'GET');
    }
    getQuizResultsForInvitee = (programId,quizId,quizLoadId)=>{
        return this.requestXPManager(`/programs/${programId}/quizzes/${quizId}/quiz-load/${quizLoadId}/results/invitees/1`, 'GET');
    }


    startBreakout = (agendaId,breakoutData) =>{
        return this.requestXPManager(`/agendas/${agendaId}/breakouts`, 'POST',breakoutData);
    }
    getAgendaInfo = (agendaId) => {
        return this.requestXPManager(`/surreal-sub-experiences/1/agenda/${agendaId}`, 'GET');
    }
    getTopics = (programId)=>{
        return this.requestXPManager(`/programs/${programId}/topics?page=0&size=2&sort=id,asc`, 'GET');
    }
}
const classroomService = new ClassroomService()
export default classroomService