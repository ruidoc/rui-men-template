
import axios from 'axios'

const instanct = axios.create({
    baseURL: 'http://api.ordosmz2.orhontech.com/',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

instanct.interceptors.request.use(request => {
    // if(localStorage.getItem('isMen')=='true') {
    //     request.baseURL = 'http://mn.pc.api.smart.ordosmz.cn/'
    // }
    // request.headers.Authorization = 'Bearer '+localStorage.token
    return request
})

instanct.interceptors.response.use(res=>{
    let mainData = res.data
    // if(res.config.method == 'get') {
        // return {
        //     data: resdata.current_page ? mainData.data.data : mainData.data,
        //     info: {
        //         'code': mainData.code,
        //         'message': mainData.message
        //     },
        //     pages: resdata.current_page ? resdata : null
        // }
    // } else {
    return mainData
    // }
})


export default instanct