<script>
	import { base } from '$app/paths';
	import BMBF_logo from '$lib/bmbf_en.svelte';
	import Uni_zambia from '$lib/uni_zambia.svelte';
</script>

<div class="bg-surface-100-800-token p-2 pt-10 bg-primary-200">
	<div class="flex justify-center">
		<span class="pr-4"> @2024 TIPPECC</span><a href={base + '/imprint'}>Imprint</a>
	</div>

	<div
		class="logo-cloud grid-cols-1 md:grid-cols-3 md:px-12 lg:px-2 xl:px-8 gap-y-1 lg:!grid-cols-7 bg-primary-100 p-2 mt-6 mb-2"
	>
		<div class="flex-center">
			<a
				class="rounded-image-hover p-2"
				href="https://www.bmbf.de/bmbf/en/home/home_node.html"
				title="BMBF"
			>
				<BMBF_logo class_overwrite="max-xl:max-w-[132px]" />
			</a>
		</div>
		<div class="flex-center">
			<a class="rounded-image-hover p-1 px-2" href="https://www.ub.bw/" title="UB">
				<img
					src="{base}/images/UB-LOGO-2_0.png"
					alt="ub logo"
					class="p-1 max-h-[90px] min-w-[50px]"
				/>
			</a>
			<a class="rounded-image-hover p-1" href="https://www.unza.zm/" title="UNZA">
				<Uni_zambia class_overwrite="max-xl:max-h-[80px] max-h-[90px]" w="50pt" />
			</a>
		</div>

		<div class="flex-center">
			<a class="rounded-image-hover p-2" href="https://www.uni-jena.de/" title="UNI Jena">
				<img src="{base}/images/uni_jena.png" alt="uni jena logo" class="p-1 max-h-[80px]" />
			</a>
		</div>
		<div class="flex-center">
			<a class="rounded-image-hover p-2" href="https://www.wits.ac.za/" title="Wits">
				<img src="{base}/images/university-witts.png" alt="wits logo" class="p-1 max-h-[80px]" />
			</a>
			<a class="rounded-image-hover p-2" href="https://www.wits.ac.za/gci/" title="GCI">
				<img src="{base}/images/gci_small.png" alt="gci logo" class="p-1 max-h-[80px]" />
			</a>
		</div>

		<div class="flex-center">
			<a
				class="rounded-image-hover p-1"
				href="https://www.climate-service-center.de/"
				title="GERICS"
			>
				<img src="{base}/images/GERICS.png" alt="gerics logo" class="p-1 max-lg:max-h-[84px]" />
			</a>
		</div>
		<div class="flex-center">
			<a class="rounded-image-hover" href="https://gobabeb.org/" title="GOBABEB">
				<img src="{base}/images/Gobabeb.png" alt="gobabeb logo" class="p-1 max-lg:max-h-[100px]" />
			</a>
		</div>

		<div class="flex-center md:col-span-3 lg:col-span-1">
			<a
				class="rounded-image-hover p-1 max-xl:max-w-[120px]"
				href="https://sasscal.org/"
				title="SASSCAL"
			>
				<img src="{base}/images/SASSCAL.png" alt="sasscal logo" class="p-1 max-lg:max-h-[100px]" />
			</a>
		</div>
	</div>
</div>
