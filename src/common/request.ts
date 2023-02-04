/*
	封装uni-app请求
*/
import config from "@/config";
interface Params {
	url: string;
	data: Record<string, any>
}
function request(params: Params, method?: "OPTIONS" | "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT" | undefined, header?: Record<string, any>) {
	let token = uni.getStorageSync('token') // || 'chainup-76358255-2095-4dd9-932c-274702f99435'
	// let authorization = uni.getStorageSync('token')
	return new Promise(function(resolve, reject) {
		uni.request({
			url: config.base_url + params.url,
			data: params.data,
			method: method,
			header: Object.assign({
				"Api-Token": 'chainup-76358255-2095-4dd9-932c-274702f99435',
				authorization: token // || '5bbabf81-82e5-4487-a7d0-93c175762fa0'
			}, header),
			dataType: 'json',
			success(res: any) {
				console.log("res==", params.url, res)
				if (res.statusCode == 200) {
					if(res.data.code == 200 && res.data.ok) {
						resolve(res.data)
					}else if(res.data.code == 4000 || !res.data.ok ){
						reject(res.data)
					}else{
						reject(res.data)
					}
				} else {
					uni.showToast({
						title: '请求数据失败:' + res.statusCode,
						icon: 'none'
					})
				}
			},
			fail(e) {
				console.log(e)
				uni.showToast({
					title: '请求失败~',
					icon: "none"
				})
				reject(e)
				// 失败回调
			},
			complete() {
				// 无论成功或失败 只要请求完成的 回调
			}
		})
	})
};
export default {
	async get(params: Params): Promise<any> {
		return await request(params, "GET");
	},
	async post(params: Params,header?: Record<string, any>):Promise<any> {
		return await request(params, "POST", header)
	},
	async put(params: Params): Promise<any>  {
		return await request(params, "PUT");
	},
	async delete(params: Params): Promise<any> {
		return await request(params, "DELETE")
	},
}
