<template>
	<view class="direct-transfer-container bg-white plr40 pt20">
		<view class="coin-detail flex-column justify-center">
			<view class="ft28 c_9397AF">{{ selectCoin?.symbol || 0 }} 余额</view>
			<view class="flex alcenter mt10">
				<view class="ft40">{{ selectCoin?.balance}} {{selectCoin?.symbol}}</view>
				<view class="ft28">≈$ {{ selectCoin?.asset_usd }}</view>
			</view>
		</view>
		<view class="form-item mt30">
			<view class="flex-between alcenter">
				<view class="ft30 c_262626">收款账号</view>
				<image src="@/static/image/dizhibu@2x.png" mode=""></image>
			</view>
		 <textarea class="mt10 pr20"  v-model="address" auto-height placeholder="输入或者粘贴钱包地址" placeholder-style="font-size:28rpx;color:#9397AF;"/>
		</view>
		<view class="form-item mt30">
			<view class="flex-between alcenter">
				<view class="ft30 c_262626">转账金额</view>
				<view class="flex alcenter" @tap="handleSelect">
					<view class="ft32">{{selectCoin.symbol}}</view>
					<image src="@/static/image/arrow-right.png" mode=""></image>
				</view>
			</view>
			<view class="flex-between alcenter mt10">
				<input class="mt10 flex-one" type="number" v-model="amount" placeholder="输入转出金额" placeholder-style="font-size:28rpx;color:#9397AF;" />
				<view class="all flex-center ml40" @tap="amount = selectCoin.balance">全部</view>
			</view>
		</view>
		<view class="form-item mt30">
			<view class="ft30 c_262626">矿工费用</view>
		</view>
		<view style="padding-bottom: 100rpx;">
			<view class="tabs flex flex-between mt30">
				<view class="tab-item flex-column alcenter flex-around" v-for="(item,index) in gas_list" :key="index" :class="{'active': tabIndex == index}" @tap="tabIndex = index">
					<view class="ft28 speed">{{index == 0 ? '慢' : index == 1 ? '推荐' : '快'}}</view>
					<view class="ft20">{{item.price}}ETH</view>
					<view class="ft20">$ {{item.usdtPrice}}</view>
					<view class="ft20 time flex-center">约{{item.minute}}分钟</view>
					<image v-if="tabIndex == index" src="@/static/image/xuanzhong_f@2x.png" mode=""></image>
				</view>
				<view class="tab-item flex-center" :class="{'active': tabIndex == 3}" @tap="tabIndex = 3">
					<view class="speed">自定义</view>
					<image v-if="tabIndex == 3" src="@/static/image/xuanzhong_f@2x.png" mode=""></image>
				</view>
			</view>
			<view class="custom-container flex-column flex-between mt30" v-if="tabIndex == 3">
				<view class="flex-between alcenter">
					<view class="flex-one mr30">
						<view class="c_9397AF">Gas Price</view>
						<input type="number" v-model="gasPrice" maxlength="20"/>
					</view>
					<view class="flex-one">
						<view class="c_9397AF">Gas Limit</view>
						<input type="number" v-model="gasLimit" maxlength="10"/>
					</view>
				</view>
				<view class="flex-end alcenter">
					<!-- <view>预计时间：30分钟</view> -->
					<view>{{customPrice}} ETH</view>
				</view>
			</view>
		</view>
		<button type="default" class="confirm-btn" @tap="handleOpen">确认</button>
		
		<uni-popup ref="popup" type="bottom" :maskClick="false">
			<view class="pop-detail-container bg-white">
				<view class="title-container h88 flex-center relative">
					<view class="ft32">交易详情</view>
					<image src="@/static/image/guanbi-3@2x.png" mode="" @tap="handleClose"></image>
				</view>
				<view class="ft32 h88 flex-center">ETH</view>
				<view class="flex alcenter item h120">
					<view class="ft28 c_9397AF label">付款地址</view>
					<view class="ft32 flex-one word">{{selectCoin.address}}</view>
				</view>
				<view class="flex alcenter item h120">
					<view class="ft28 c_9397AF label">收款地址</view>
					<view class="ft32 flex-one word">{{address}}</view>
				</view>
				<view class="flex item h120">
					<view class="ft28 c_9397AF label mt10">矿工费</view>
					<view class="ft32 flex-one">
						<view class="ft40">{{tabIndex == 3 ? customPrice : gas_list[tabIndex] && gas_list[tabIndex].price}} ETH</view>
						<view class="ft28">≈$ {{tabIndex == 3 ? customUsdtPrice : gas_list[tabIndex] && gas_list[tabIndex].usdtPrice}}</view>
					</view>
				</view>
				<button type="default" class="pay-btn" @tap="handleSubmit">确认支付</button>
			</view>
		</uni-popup>
	</view>
</template>

<script lang="ts">
	import { onLoad } from '@dcloudio/uni-app';
	import { ref, defineComponent, getCurrentInstance, ComponentInternalInstance, computed } from 'vue'
	import config from '@/config'
	import { getDeviceInfo } from '@/common/utils';
	export default defineComponent({
		setup() {
			const { proxy } = getCurrentInstance() as ComponentInternalInstance;
			const deviceId = ref('')
			const currentWallet = ref<Record<string, any>>({})
			const selectCoin = ref<Record<string, any>>({})
			const address = ref('')
			const amount = ref('')
			const signData = ref<Record<string, any>>({})
			const gas_list = ref<any[]>([])
			const tabIndex = ref(0)
			const gasPrice = ref<number>(0)//比慢的大
			const gasLimit = ref<number>(0)// 大于21000
			const popup = ref()

			const customPrice = computed(() => {
				if(!gasLimit.value) return 0
				if(!gasPrice.value) return 0
				return (gasLimit.value * gasPrice.value / 10e18).toFixed(4)
			})
			const customUsdtPrice = computed(() => {
				if(!gasLimit.value) return 0
				if(!gasPrice.value) return 0
				return (gasLimit.value * gasPrice.value / 10e18 * signData.value.usdt_pirce).toFixed(2)
			})
			
			onLoad(async ()=>{
				// 获取设备信息
				const deviceInfo = await getDeviceInfo()
				deviceId.value = deviceInfo.device_id
				currentWallet.value = uni.getStorageSync('currentWallet')
				selectCoin.value = currentWallet.value?.token_list[0] || {}
				selectCoin.value.balance = Number(selectCoin.value.balance).toFixed(4)
				selectCoin.value.asset_usd = Number(selectCoin.value.asset_usd).toFixed(4)
				loadSignData()
			})

			const loadSignData = () =>{
				proxy?.$api.get_sign_tx_info({
					chain: currentWallet.value.chain,
					address: currentWallet.value.address
				}).then(res => {
					signData.value = res.result
					gas_list.value = signData.value.gas_list.map((item: any) => {
						return {
							...item,
							minute: item.index == 50 ? 30 : item.index == 200 ? 3 : 1,
							price: (signData.value.gas_limit * item.gas_price / 10e18).toFixed(4),
							usdtPrice: (signData.value.gas_limit * item.gas_price / 10e18 * signData.value.usdt_pirce).toFixed(2)
						}
					})
					gas_list.value = gas_list.value.filter(item => {
						return item.index != 500
					})
				})
			}
			const handleOpen = () =>{	
				if(!address.value) {
					return proxy?.$alert('输入或者黏贴钱包地址')
				}else if(!amount.value) {
					return proxy?.$alert('输入正确的转出数量')
				}else{
					if(tabIndex.value == 3){
						if(gasPrice.value < gas_list.value[0].gas_price){
							return proxy?.$alert(`Gas Price至少为${gas_list.value[0].gas_price}`)
						}
						if(gasLimit.value < 21000){
							return proxy?.$alert(`Gas Limit至少为21000`)
						}
					}
					popup.value.open()	
				}
			}
			const handleClose = () =>{
				popup.value.close()
			}
			const handleSelect = () =>{
				let list = currentWallet.value.token_list.map((item: any) => {
					return item.symbol
				})
				uni.showActionSheet({
				    itemList: list,
				    success: (res) => {
						selectCoin.value = currentWallet.value.token_list[res.tapIndex]
						amount.value = ''
				    },
				    fail: (res) => {
				        console.log(res.errMsg);
				    }
				});
			}
			const handleSubmit = () =>{
				uni.showLoading({
					title: '请稍等',
					mask: true
				})
				const { wallet_uuid } = currentWallet.value
				const { contract_addr, address_list, symbol } = selectCoin.value
				proxy?.$api.send_tx({
					device_id: deviceId.value,
					wallet_uuid,
					contract_addr,
					from_address: address_list[0].address,
					to_address: address.value,
					amount: parseFloat(parseFloat(amount.value).toFixed(4)),
					asset_name: symbol,//TODO: check
					gas_price: tabIndex.value == 3 ? gasPrice.value.toString() : gas_list.value[tabIndex.value].gas_price.toString(),
					gas_limit: tabIndex.value == 3 ? gasLimit.value.toString() : signData.value.gas_limit.toString()
				}).then(res => {
					uni.hideLoading()
					handleClose()
					uni.navigateBack()
				}).catch(err => {
					handleClose()
					proxy?.$alert('矿工费不足')
				})
			}
			
			return {
				deviceId,
				currentWallet,
				selectCoin,
				address,
				amount,
				signData,
				gas_list,
				tabIndex,
				gasPrice, //比慢的大
				gasLimit, // 大于21000
				customPrice,
				customUsdtPrice,
				popup,
				loadSignData,
				handleOpen,
				handleClose,
				handleSelect,
				handleSubmit,
			}
		},
	})
</script>

<style lang="scss">
	page{
		background-color: #F0F2F5;
	}
	.direct-transfer-container{
		.coin-detail{
			height: 160rpx;
			background: #FFFFFF;
			padding-left: 44rpx;
			box-shadow: 0rpx 20rpx 20rpx 0rpx rgba(76, 110, 245, 0.1);
			border-radius: 20rpx;
			box-sizing: border-box;
		}
		.form-item{
			padding: 20rpx 0 30rpx;
			border-bottom: 1rpx solid #EBEBED;
			image{
				width: 44rpx;
				height: 44rpx;
			}
			input{
				width: 100%;
				height: 48rpx;
			}
			textarea{
				width: 100%;
			}
			.all{
				width: 90rpx;
				height: 44rpx;
				border-radius: 22rpx;
				color: #4C6EF5;
				border: 2rpx solid #4C6EF5;
			}
		}
		.tabs{
			.tab-item{
				position: relative;
				width: 160rpx;
				height: 160rpx;
				color: #9397AF;
				background: #FFFFFF;
				border-radius: 10rpx;
				border: 2rpx solid #E5EAEF;
				.speed{
					color: #222222;
				}
				.time{
					width: 100%;
					height: 40rpx;
					background: #F7F8FC;
					border-radius: 0rpx 0rpx 10rpx 10rpx;
					border-top: 1rpx solid #E5EAEF;
				}
				&.active{
					border-color: #4C6EF5;
					color: #4C6EF5;
					background: rgba(76, 110, 245, 0.05);
					.speed{
						color: #4C6EF5;
					}
				}
				image{
					position: absolute;
					top: -3rpx;
					right: 0;
					width: 32rpx;
					height: 20rpx;
					z-index: 20;
				}
			}
		}
		.custom-container{
			height: 220rpx;
			background: #F7F8FC;
			padding: 20rpx 24rpx 24rpx;
			box-sizing: border-box;
			input{
				width: 100%;
				height: 60rpx;
				padding: 0 20rpx;
				background: #FFFFFF;
				border-radius: 10rpx;
				border: 2rpx solid #E6E8EA;
				margin-top: 10rpx;
				box-sizing: border-box;
			}
		}
		.confirm-btn{
			width: 686rpx;
			height: 96rpx;
			line-height: 96rpx;
			font-size: 32rpx;
			color: #ffffff;
			background: #4C6EF5;
			box-shadow: 0rpx 20rpx 40rpx 0rpx rgba(76, 110, 245, 0.5);
			border-radius: 20rpx;
			&::after{
				border: none;
			}
		}
		.pop-detail-container{
			height: 890rpx;
			.title-container{
				border-bottom: 1rpx solid #EBEBED;
				image{
					position: absolute;
					top: 50%;
					right: 32rpx;
					transform: translateY(-50%);
					width: 24rpx;
					height: 24rpx;
				}
			}
			.item{
				padding: 0 68rpx 0 60rpx;
				.label{
					width: 112rpx;
					margin-right: 76rpx;
				}
				.word{
					word-break: break-word;
					line-height: 44rpx;
				}
			}
			.pay-btn{
				width: 686rpx;
				height: 96rpx;
				line-height: 96rpx;
				color: #ffffff;
				background: #4C6EF5;
				box-shadow: 0rpx 20rpx 40rpx 0rpx rgba(76, 110, 245, 0.5);
				border-radius: 20rpx;
				margin-top: 100rpx;
			}
		}
	}
</style>
