<script lang="ts">
	import { Plus } from '@lucide/svelte';

	import Logo from '$lib/assets/images/logo.svg?component';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Container } from '$lib/components/ui/container';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { appName } from '$lib/data/app';
	import { secretMenu } from '$lib/data/menu';
	import { m } from '$lib/paraglide/messages.js';
	import { localizeHref } from '$lib/paraglide/runtime';

	import IntersectionObserver from '../helpers/intersection-observer.svelte';

	type Props = {
		user: App.Locals['user'];
		isMinimal?: boolean;
		isPersistent?: boolean;
		tag?: string;
		breadcrumb?: string;
	};

	let { user, isMinimal, isPersistent: isPersistent, tag, breadcrumb }: Props = $props();

	let persistHeader = $derived(isPersistent || !!tag);
</script>

<IntersectionObserver bottom={persistHeader ? 0 : 100}>
	{#snippet children(intersecting)}
		<header class="relative z-10 h-[var(--header-height)] transition-all">
			<div
				class="fixed top-0 left-0 h-[var(--header-height)] w-full transition-all duration-300 ease-in-out {intersecting &&
				!persistHeader
					? 'bg-transparent'
					: 'bg-card shadow-sm'}"
			>
				<Container variant="wide" class="flex h-16 items-center">
					<a
						class="flex items-center py-2 transition duration-150 ease-in-out {intersecting &&
						!persistHeader
							? 'translate-x-4 scale-150 opacity-0'
							: 'scale-100 opacity-100'}"
						href={localizeHref('/')}
					>
						<Logo class="h-10 w-10" />
						<span class="sr-only">{m.red_trite_turkey_flip()}</span>
						<span
							class="p-2 text-lg font-semibold transition delay-100 duration-150 ease-in-out {intersecting &&
							!persistHeader
								? 'hidden translate-x-4 scale-150 opacity-0'
								: 'visible translate-x-0 scale-100 opacity-100'}">{appName}</span
						>
						{#if !!tag}
							<span class="bg-foreground text-background inline-flex rounded-md px-2 py-1 text-xs"
								>{tag}</span
							>
						{/if}
						{#if !!breadcrumb}
							<span class="text-muted-foreground inline-flex items-center py-1 font-medium">
								{breadcrumb}</span
							>
						{/if}
					</a>

					<div class="ml-auto grid grid-flow-col items-center gap-2">
						{#if !isMinimal && user}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button {...props} variant="outline" size="sm" class="mr-2 gap-1.5">
											<Plus
												class="h-4 w-4 transition-all {props['data-state'] === 'open'
													? 'rotate-45'
													: 'rotate-0'}"
											/>
											{m.calm_tidy_finch_label()}
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content class="w-56">
									<DropdownMenu.Group>
										<DropdownMenu.Label>{m.ideal_brave_eagle_trust()}</DropdownMenu.Label>
										<DropdownMenu.Separator />

										{#each secretMenu() as menuItem (menuItem.href)}
											<DropdownMenu.Item>
												{#snippet child({ props })}
													<a href={localizeHref(menuItem.href)} {...props}
														><menuItem.icon class="me-2 h-4 w-4" />{menuItem.label}</a
													>
												{/snippet}
											</DropdownMenu.Item>
										{/each}
									</DropdownMenu.Group>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}

						{#if user}
							<a href={localizeHref('/account')} class="relative mr-2">
								<Avatar.Root>
									<Avatar.Image src={user.picture} alt={user.name} />
									<Avatar.Fallback
										class="border-foreground bg-foreground text-background border uppercase"
										>{Array.from(user.email)[0]}</Avatar.Fallback
									>
								</Avatar.Root>
							</a>
						{:else}
							<Button variant="ghost" size="sm" href={localizeHref('/login')}>
								{m.simple_dry_boar_dazzle()}
							</Button>
							<Button variant="outline" size="sm" href={localizeHref('/signup')}>
								{m.large_smart_badger_beam()}
							</Button>
						{/if}

						<!-- Hamburger menu (temporarily disabled)
						{#if !isMinimal}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button {...props} variant="ghost" size="icon">
											{#if props['data-state'] === 'open'}
												<X class="h-5 w-5" />
											{:else}
												<Menu class="h-5 w-5" />
											{/if}
											<span class="sr-only">{m.plain_wise_crane_navigate()}</span>
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									class="max-h-[calc(100vh-5rem)] w-72 overflow-y-auto sm:w-lg sm:p-6"
									align="end"
									sideOffset={-3}
								>
									<DropdownMenu.Arrow class="text-border" width={8} height={6} />

									<div class="sm:grid sm:grid-cols-2 sm:gap-x-2">
										{#each mainNav() as group, groupIndex (group.title)}
											{#if groupIndex > 0}
												<DropdownMenu.Separator class="sm:hidden" />
											{/if}
											<DropdownMenu.Group>
												<DropdownMenu.Label>{group.title}</DropdownMenu.Label>
												{#each group.items as item (item.href)}
													<DropdownMenu.Item>
														{#snippet child({ props })}
															<a href={localizeHref(item.href)} {...props}>{item.label}</a>
														{/snippet}
													</DropdownMenu.Item>
												{/each}
											</DropdownMenu.Group>
										{/each}
									</div>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						{/if}
						-->
					</div>
				</Container>
			</div>
		</header>
	{/snippet}
</IntersectionObserver>
