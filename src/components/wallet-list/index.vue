<template>
	<view class="my-wallet-container flex">
		<view class="left-menu">
			<view class="menu-item flex-center" :class="{'active': menuIndex == index}" v-for="(item, index) in menus" :key="index" @tap="changeMenu(index)">
				<image :src="menuIndex == index ? item.active_logo : item.logo" mode=""></image>
			</view>
		</view>
		<div class="right-container flex-one">
			<view class="flex-between alcenter pl10 pr40 h80">
				<view class="ft32">{{menus[menuIndex] && menus[menuIndex].name}}</view>
				<image src="@/static/image/tianjia@2x.png" mode="" class="add-img" @tap="handleAdd"></image>
			</view>
			<view class="add-wallet flex-center" @tap="handleAdd" v-if="currentMenuData.length == 0">添加钱包</view>
			<view :class="[`wallet-${menuIndex}`, 'wallet-item flex-around flex-column c-white pl30 pr20']" v-for="(item, index) in currentMenuData" :key="index" @tap="handleSelectWallet(item)">
				<view class="flex alcenter">
					<view class="ft28">{{item.wallet_name}}</view>
					<view class="current ft22" v-if="item.wallet_uuid == currentWallet.wallet_uuid">当前</view>
				</view>
				<view class="flex-between alcenter">
					<view class="flex alcenter mr20" style="width: 360rpx;overflow: hidden;">
						<view class="address">{{item.address}}</view>
						<image src="@/static/image/copy.png" mode="" class="copy-img" @tap="handleCopy(item.address)"></image>
					</view>
					<view>{{item.balance && (Number(item.balance)).toFixed(4)}}ETH</view>
				</view>
			</view>
		</div>
	</view>
</template>

<script lang="ts">
	import { ref, defineComponent, getCurrentInstance, ComponentInternalInstance, onMounted, watch } from 'vue'
	import { CHAIN_LIST } from '@/common/constants';
	export default defineComponent({
		name: 'walletList',
		props: {
			walletList: {
				type: Array,
      			default: (): any[] => []
			}
		},
		emits: ['changeWallet'],
		setup(props, { emit }) {
			const { proxy } = getCurrentInstance() as ComponentInternalInstance;
			const menus = ref(CHAIN_LIST)
			const menuIndex = ref<number>(0)
			const currentWallet = ref<Record<string,any>>({})
			const currentMenuData = ref<any[]>([])
			const walletList = ref<any[]>([])
			onMounted(() => {
				currentWallet.value = uni.getStorageSync('currentWallet')
				walletList.value  = uni.getStorageSync('walletData') || {}
			})
			watch(
			() => props.walletList,
			(newWalletList: any[]) => {
				const curMenu = menus.value[menuIndex.value]
				currentMenuData.value = newWalletList[curMenu.id] || []
			}
			)
			const changeMenu = async(index: number)=>{
				menuIndex.value = index
				const curMenu = menus.value[index]
				currentMenuData.value = walletList.value[curMenu.id] || []
			}
			const handleAdd = () =>{
				const currentCryptocurrency = menus.value[menuIndex.value];
				if(!currentCryptocurrency.support) {
					return proxy?.$alert('暂不支持')
				}
				uni.showActionSheet({
				    itemList: ['创建', '导入'],
				    success: (res) => {
				        if(res.tapIndex == 0) {
							uni.navigateTo({
								url: `/pages/my/createWallet?chain_name=${currentCryptocurrency.name}`
							})
						}else{
							uni.navigateTo({
								url: `/pages/home/importWallet?chain_name=${currentCryptocurrency.name}`
							})
						}
				    },
				    fail: (res) => {
				        console.log(res.errMsg);
				    }
				});
			}
			const handleSelectWallet = (data: any) => {
				emit('changeWallet',data)
			}
			const handleCopy = (address: string)=> {
				uni.setClipboardData({
					data: address,
					success: () => {
						uni.showToast({
							title: '复制成功'
						})
					}
				})
			}
			return {
			menus,
			menuIndex,
			currentWallet,
			currentMenuData,
			walletList,
			changeMenu,
			handleAdd,
			handleSelectWallet,
			handleCopy,
			}
		}
	})
</script>

<style lang="scss">
	.my-wallet-container{
		.left-menu{
			width: 160rpx;
			background: #F1F3F5;
			height: 100vh;
			/* #ifdef H5 */
			height: calc(100vh - var(--window-top));
			/* #endif */
			overflow-y: scroll;
			.menu-item{
				width: 100%;
				height: 122rpx;
				&.active{
					background-color: #ffffff;
				}
				image{
					width: 80rpx;
					height: 80rpx;
					border-radius: 20rpx;
				}
			}
		}
		.right-container{
			.add-img{
				width: 44rpx;
				height: 44rpx;
			}
			.add-wallet{
				width: 520rpx;
				height: 86rpx;
				border-radius: 20rpx;
				border: 2rpx dashed #222222;
				margin:0 40rpx 20rpx 30rpx;
			}
			.wallet-item{
				width: 520rpx;
				height: 140rpx;
				background: #FF8E40;
				border-radius: 20rpx;
				margin:0 40rpx 20rpx 30rpx;
				box-sizing: border-box;
				.address{
					max-width: 300rpx;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
				.current{
					height: 32rpx;
					padding: 0 10rpx;
					background-color: #ffffff;
					color: #FF8E40;
					border-radius: 8rpx;
					margin-left: 16rpx;
				}
				&.wallet-1{
					background: #585757;
					.current{
						color: #585757;
					}
				}
				&.wallet-2{
					background: #21B67E;
					.current{
						color: #21B67E;
					}
				}
				&.wallet-3{
					background: #4F85E9;
					.current{
						color: #4F85E9;
					}
				}
				&.wallet-4{
					background: #000;
					.current{
						color: #000;
					}
				}
				.copy-img{
					width: 24rpx;
					height: 24rpx;
					margin-left: 28rpx;
					flex-shrink: 0;
				}
			}
		}
	}
</style>
