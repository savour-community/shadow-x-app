<template>
	<view class="create-wallet-container">
		<view class="form-item">
			<view class="ft32 mb20">设置身份钱包名</view>
			<input class="h60 ft26" type="text" v-model="walletName" placeholder="请输入名称" placeholder-style="font-size: 26rpx;color: #9397AF;" />
		</view>
		<view class="form-item">
			<view class="ft32 mb20">设置密码</view>
			<input class="h60 ft26" password v-model="password" placeholder="密码不少于8位,至少包含1个字母和一个数字" placeholder-style="font-size: 26rpx;color: #9397AF;" />
		</view>
		<view class="form-item">
			<view class="ft32 mb20">确认密码</view>
			<input class="h60 ft26" password v-model="confirmPassword" placeholder="密码不少于8位,至少包含1个字母和一个数字" placeholder-style="font-size: 26rpx;color: #9397AF;" />
		</view>
		<view class="flex flex-wrap alcenter pl40 mt40">
			<checkbox value="cb" :checked="checked" color="#94A9FF" @tap="handleCheck" style="border-radius: 50%;"/>
			我已阅读并同意
			<text class="c_4C6EF5">《用户协议》</text>
			以及
			<text class="c_4C6EF5">《隐私政策》</text>
		</view>
		<button type="default" class="create-btn" :class="{'active': isActive}" @tap="handleSave">创建钱包</button>
	</view>
</template>
<script lang="ts">
	import { ComponentInternalInstance, computed, defineComponent, getCurrentInstance, ref } from 'vue'
	import { rules } from '@/common/utils/validation';
	import { onLoad } from '@dcloudio/uni-app';
	export default defineComponent({
		setup() {
			// const walletName = ref('amy')
			// const password = ref('1234567a')
			// const confirmPassword = ref('1234567a')
			// const checked = ref(true)
			const walletName = ref('')
			const password = ref('')
			const confirmPassword = ref('')
			const checked = ref(false)
			const chain_name = ref('')
			const { proxy } = getCurrentInstance() as ComponentInternalInstance;
			const isActive = computed(() => {
				return walletName.value && password.value.length >= 8 && password.value == confirmPassword.value && checked.value
			})
			onLoad((options?: AnyObject | undefined)=>{
				if(options?.chain_name) {
				chain_name.value = options.chain_name
				uni.setNavigationBarTitle({
					title: `创建${options?.chain_name}钱包`
				})
			}
			})
			const handleCheck = ()=> {
				checked.value = !checked.value
			}
			const handleSave = () => {
				if(!isActive.value) return
				if(!rules.password.isVaild(password.value)){
					proxy?.$alert(rules.password.message)
					return
				}
				if(!rules.walletName.isVaild(walletName.value)){
					proxy?.$alert(rules.walletName.message)
					return
				}
				uni.navigateTo({
					url: `/pages/home/backupWord?chain_name=${chain_name.value}&walletName=${walletName.value}&password=${password.value}`
				})
				
			}
			return {
				walletName,
				password,
				confirmPassword,
				checked,
				chain_name,
				isActive,
				handleCheck,
				handleSave
			}
		},
	})
</script>

<style lang="scss">
	.create-wallet-container{
		.form-item{
			padding: 34rpx 24rpx 0 38rpx;
			input{
				border-bottom: 1rpx solid #EBEBED;
			}
		}
		.create-btn{
			position: fixed;
			bottom: 160rpx;
			left: 30rpx;
			width: 686rpx;
			height: 96rpx;
			line-height: 96rpx;
			font-size: 32rpx;
			color: #ffffff;
			background: #94A9FF;
			box-shadow: 0rpx 20rpx 40rpx 0rpx rgba(76, 110, 245, 0.5);
			border-radius: 20rpx;
			&.active{
				background: #4C6EF5;
			}
			&:after{
				border: none;
			}
		}
	}
</style>
