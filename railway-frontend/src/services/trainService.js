// // src/services/trainService.js
// import api from "../api";
// import axios from "axios"; 

// // Base prefix using API Gateway routing
// const BASE = "api/v1/trains"; // maps to http://localhost:8765/api/v1/trains

// export const getAllTrains = async () => {
//   const res = await api.get(`${BASE}/allTrains`);
//   return res.data;
// };

// export const getTrainById = async (trainId) => {
//   const res = await api.get(`${BASE}/getTrainById/${trainId}`);
//   return res.data;
// };

// // export const getTrainByNumber = async (trainNumber) => {
// //   // Endpoint expects raw string body
// //   const res = await api.post(`${BASE}/getTrainByNumber`, trainNumber);
// //   return res.data;
// // };

// export const getTrainByNumber = async (trainNumber) => {
//   // Send raw string body, not JSON
//   const res = await api.post(
//     `${BASE}/getTrainByNumber`, 
//     trainNumber, 
//     {
//       headers: { "Content-Type": "text/plain" } // 👈 important
//     }
//   );
//   return res.data;
// };


// export const getAllTrainsByName = async (trainName) => {
//   const res = await api.get(`${BASE}/getAllTrainsByName`, {
//     params: { trainName },
//   });
//   return res.data;
// };

// export const searchBySourceAndDestination = async (source, destination) => {
//   const res = await api.get(`${BASE}/search`, {
//     params: { source, destination },
//   });
//   return res.data;
// };

// export default {
//   getAllTrains,
//   getTrainById,
//   getTrainByNumber,
//   getAllTrainsByName,
//   searchBySourceAndDestination,
// };

import api from "../api";
import axios from "axios";

const BASE = "http://localhost:8765/api/v1/trains";

export const getAllTrains = async () => {
  try {
    const res = await axios.get(`${BASE}/allTrains`);
    return res.data;
  } catch (error) {
    console.error('getAllTrains error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTrainById = async (trainId) => {
  try {
    const res = await axios.get(`${BASE}/getTrainById/${trainId}`);
    return res.data;
  } catch (error) {
    console.error('getTrainById error:', error.response?.data || error.message);
    throw error;
  }
};

export const getTrainByNumber = async (trainNumber) => {
  try {
    const res = await axios.post(`${BASE}/getTrainByNumber`, trainNumber, {
      headers: { "Content-Type": "text/plain" },
    });
    return res.data;
  } catch (error) {
    console.error('getTrainByNumber error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAllTrainsByName = async (trainName) => {
  try {
    const res = await axios.get(`${BASE}/getAllTrainsByName`, {
      params: { trainName },
    });
    return res.data;
  } catch (error) {
    console.error('getAllTrainsByName error:', error.response?.data || error.message);
    throw error;
  }
};

export const searchBySourceAndDestination = async (source, destination) => {
  try {
    const res = await axios.get(`${BASE}/search`, {
      params: { source, destination },
    });
    return res.data;
  } catch (error) {
    console.error('searchBySourceAndDestination error:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  getAllTrains,
  getTrainById,
  getTrainByNumber,
  getAllTrainsByName,
  searchBySourceAndDestination,
};


