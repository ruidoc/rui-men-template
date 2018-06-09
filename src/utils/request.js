
import axios from 'axios'

const instanct = axios.create({
    baseURL: 'http://api.ordosmz2.orhontech.com/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

instanct.interceptors.response.use((res)=>{
    if(res.status==200) {
        return res.data
    }
})

export default instanct