<template>
	<div id="enter-app">
		<!-- <transition name="slide"> -->
			<router-view></router-view>
		<!-- </transition> -->
	</div>
</template>

<script>
	export default {
		name: "enter-app"
	};
</script>

<style>
	@font-face {
		font-family: 'OrhonChaganTig';
		src: url('./assets/OrhonChaganTig.eot');
		src: url('./assets/OrhonChaganTig.eot?#iefix') format('embedded-opentype'),
		url('./assets/OrhonChaganTig.ttf') format('truetype'); 
	}
	#enter-app {
		position: relative;
		width: 100%;
		height: 100%;
		background: #f5f5f5;
	}
</style>
