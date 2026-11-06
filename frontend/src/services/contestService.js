import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8000/api/v1/contest",
});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export const createContest = (data) =>
    API.post("/create", data);

export const joinContest = (data) =>
    API.post("/join", data);

export const startContest = (contestCode) =>
    API.post(`/start/${contestCode}`);

export const getContest = (contestCode) =>
    API.get(`/${contestCode}`);

export const getLeaderboard = (contestCode) =>
    API.get(`/leaderboard/${contestCode}`);

// import axios from "axios";

// const token = localStorage.getItem("token");

// const API = axios.create({
//   baseURL: "http://localhost:8000/api/v1/contest",
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export const createContest = (data) => API.post("/create", data);

// export const joinContest = (data) => API.post("/join", data);

// export const startContest = (data) => API.post("/start", data);

// export const getContest = (contestCode) =>
//   API.get(`/${contestCode}`);

// export const getLeaderboard = (contestCode) =>
//   API.get(`/leaderboard/${contestCode}`);