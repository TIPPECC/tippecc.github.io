<script>
	import { base } from '$app/paths';
	import BMBF_logo from '$lib/bmbf_en.svelte';
	import Uni_zambia from '$lib/uni_zambia.svelte';
</script>

<footer class="bg-surface-100-800-token p-2 pt-10 bg-primary-200">
	<div class="flex justify-center">
		<span class="pr-4"> @2023 TIPPECC</span><a href={base + '/imprint'}>Imprint</a>
	</div>

	<!--<div class="flex flex-1 bg-white h-10">-->
	<div class="logo-cloud grid-cols-1 lg:!grid-cols-3 gap-2 bg-primary-100 pt-4 pr-4 pl-4 mt-6">
		<div class=""><BMBF_logo /></div>
		<div><img src="{base}/uni_jena.png" alt="test" class="p-1" /></div>
		<div><img src="{base}/GCI.jpg" alt="test" class="p-4" /></div>

		<div><img src="{base}/GERICS.png" alt="test" class="p-8" /></div>
		<div><img src="{base}/Gobabeb.png" alt="test" class="p-4" /></div>

		<div class="flex">
			<img src="{base}/UB-LOGO-2_0.png" alt="test" class="h-full p-8 pr-14" />
			<Uni_zambia />
		</div>
	</div>
</footer>
