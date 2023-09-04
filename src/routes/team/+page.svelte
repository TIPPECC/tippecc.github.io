<script>
	import { base } from '$app/paths';
	import group from '$lib/icons/group-svgrepo-com.svg';
	import orcid from '$lib/icons/orcid-svgrepo-com.svg';
	import website from '$lib/icons/web-svgrepo-com.svg';

	let team = [
		{
			title: 'Dr.',
			name: 'Sophie',
			surname: 'Biskop',
			role: 'co-project leader & hydrologist',
			email: '',
			image: '/biskop.webp',
			work_packages: ['WP2'],
			webpage: 'https://www.geographie.uni-jena.de/en/biskop',
			org: 'Uni Jena'
		},
		{
			name: 'Franziska',
			surname: 'Zander',
			role: 'research data manager & scientific software developer',
			email: '',
			image: '/zander.webp',
			work_packages: ['WP3'],
			webpage: 'https://www.geographie.uni-jena.de/en/zander',
			orcid: '0000-0001-6892-7046',
			org: 'Uni Jena'
		},
		{
			title: 'Dr.',
			name: 'Sven',
			surname: 'Kralisch',
			role: 'external contractor & scientific software developer',
			email: '',
			// image: '/zander.webp',
			work_packages: ['WP2', 'WP3'],
			// webpage: 'https://www.geographie.uni-jena.de/en/kralisch'
			orcid: '0000-0003-2895-540X',
			org: 'Uni Jena'
		}
	];
</script>

<div class="content-div">
	<div class="flex">
		<h1 class="content-heading">Team</h1>
		<img src={group} alt="..." width="30px" />
	</div>
	<blockquote class="content-blockquote mb-4">
		TIPPECC is coordinated by <br />
		<div class="pl-4 italic">
			Global Change Institute (GCI), University of the Witwatersrand (WITS), South Africa.
			<span class="chip bg-green-700 pl-2"><b>GCI-WITS</b></span
			>
		</div>
		<br />
		Collaborating partners are the <br>
		<div class="pl-4 italic">
			Helmholtz-Zentrum Geesthacht, Climate Service Center Germany, Hamburg
			<span class="chip bg-green-700 pl-2"><b>HZG-GERICS</b></span>
		</div>
		<div class="pl-4 italic">
			Friedrich Schiller University Jena, Germany
			<span class="chip bg-green-700 pl-2"><b>Uni Jena</b></span>
		</div>
		<div class="pl-4 italic">
			University of Zambia
			<span class="chip bg-green-700 pl-2"><b>UNZA-IWRMC</b></span>
		</div>
		<div class="pl-4 italic">
			Namibian University for Science and Technology in Southern Africa
			<span class="chip bg-green-700 pl-2"><b>NUST</b></span>
		</div>
		<div class="pl-4 italic">
			University of Botswana
			<span class="chip bg-green-700 pl-2"><b>UB</b></span>
		</div>

	</blockquote>
	<section>
		<div class="w-full text-token grid grid-cols-1 md:grid-cols-2 gap-4 pt-10">
			{#each team as member}
				<div class="card p-2 flex flex-col w-full border border-5 border-white">
					<div class="text-left mt-[-28px]">
						<span class="chip bg-red-700"><b>{member.org}</b></span>
					</div>

					<div class="flex">
						<div>
							<figure
								class="avatar flex aspect-square text-surface-50 font-semibold justify-center items-center overflow-hidden isolate bg-surface-400-500-token w-20 rounded-full"
								data-testid="avatar"
							>
								<img
									class="avatar-image w-full h-full object-cover"
									src="{base}{member.image ? member.image : '/rain.png'}"
									alt=""
									style=""
								/>
							</figure>
						</div>
						<div class="pl-5">
							<h3 class="h3">
								{#if member.title}{member.title} {/if}{member.name}
								{member.surname}
							</h3>
							{#if member.webpage}<div class="flex">
									<img src={website} alt="Contact see website" width="20px" /><a
										href={member.webpage}
										target="_blank"
										class="pl-1 underline">website</a
									>
								</div>{/if}
							{#if member.orcid}<div class="flex">
									<img src={orcid} alt="ORCID" width="20px" /><a
										href="https://orcid.org/{member.orcid}"
										target="_blank"
										class="pl-1 underline">{member.orcid}</a
									>
								</div>{/if}
						</div>
					</div>
					<div />
					<hr class="m-2" />
					<div class="">
						<div class="pb-2"><em>{member.role}</em></div>
					</div>
					<div class="pt-2 mt-auto w-full">
						<div class="flex justify-end">
							[
							{#each member.work_packages as wp}
								<a href="/work_packages/{wp.toLowerCase()}" class="m-1 underline">{wp}</a>
							{/each}
							]
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
