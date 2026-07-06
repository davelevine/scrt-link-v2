<script lang="ts">
	import Logo from '$lib/assets/images/logo.svg?component';
	import { m } from '$lib/paraglide/messages.js';

	import { appName } from '../../data/app';
	import { companyMenu, helpMenu, productMenu, secretMenu } from '../../data/menu';
	import Container from '../ui/container/container.svelte';
	import LanguageSwitcher from '../ui/language-switcher';
	import FooterMenu from '../ui/menu';
	import DarkModeSwitcher from './dark-mode-switcher.svelte';
</script>

<footer class="border-border bg-background border-t pt-14 shadow-[0_0_60px_0_rgba(0,0,0,0.08)]">
	<Container variant="wide" class="flex flex-col">
		<div class="w-full md:flex">
			<div class="min-w-36 shrink-0 pr-8 pb-10">
				<div class="flex items-center">
					<Logo class="h-10 w-10" />
					<span class=" text-lg font-semibold">{appName}</span>
				</div>
			</div>

			<div class="mb-4 grid w-full grid-cols-2 items-start gap-4 pt-1 md:flex md:gap-14">
				<FooterMenu title={m.funny_swift_jay_promise()} menu={secretMenu()} />
				<FooterMenu title={m.tiny_suave_nils_accept()} menu={productMenu()} />
				<FooterMenu title={m.chunky_raw_osprey_dial()} menu={companyMenu()} />
				<FooterMenu title={m.equal_away_frog_aim()} menu={helpMenu()} />
			</div>
		</div>

		<div class="pb-8 md:flex">
			<div class="text-muted-foreground flex flex-wrap items-center gap-x-2 py-2 text-sm">
				<span>©{new Date().getFullYear()} {appName}</span>
				<span aria-hidden="true">·</span>
				<a
					href="https://github.com/stophecom/scrt-link-v2"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:text-foreground underline underline-offset-2 transition-colors"
				>
					{m.footer_based_on()}
				</a>
			</div>

			<div class="ms-auto flex items-center gap-4 py-5 md:py-2">
				<DarkModeSwitcher />
				<LanguageSwitcher />
			</div>
		</div>
	</Container>
</footer>
