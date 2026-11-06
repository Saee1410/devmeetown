let IS_PROD = false;
const server = IS_PROD ?
    //"https://apnacollegebackend.onrender.com" :
    
    "https://devmeet-backend-t592.onrender.com" :
    "http://localhost:8000"


export default server;