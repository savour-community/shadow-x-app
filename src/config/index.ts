let base_url = 'http://193.203.215.185:8080/'
// API地址
// #ifdef APP-PLUS
base_url = 'http://193.203.215.185:8080/'
// #endif
// #ifdef H5
base_url=  '/api/'
// #endif

export default {
	base_url,
	imgUrl: 'http://193.203.215.185:8080/media/',
	socketBaseUrl: 'ws://193.203.215.185:8080'
}