"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  ChevronDown,
  Coins,
  Copy,
  ExternalLink,
  GraduationCap,
  Lightbulb,
  RefreshCw,
  Rocket,
  Sparkles,
  Ticket,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} animate-pulse rounded-xl border border-border bg-white/5`}
  />
);

// 模块标题区(图标 + 标题 + 简介)
function ModuleHeader({
  icon: Icon,
  title,
  intro,
}: {
  icon: LucideIcon;
  title: string;
  intro: string;
}) {
  return (
    <div className="mb-8 text-center scroll-reveal md:mb-12">
      <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] md:mb-4 md:h-16 md:w-16">
        <Icon className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />
      </div>
      <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">{title}</h2>
      <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
        {intro}
      </p>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const m = t.modules as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenith-inc.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Zenith Inc Wiki",
        description:
          "Complete Zenith Inc Wiki covering tower progression, upgrades, currencies, prestige mechanics, automation systems, and free codes for the Roblox incremental tower simulator.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Zenith Inc - Roblox Incremental Tower Simulator",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Zenith Inc Wiki",
        alternateName: "Zenith Inc",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Zenith Inc Wiki - Roblox Incremental Tower Simulator",
        },
        sameAs: [
          "https://www.roblox.com/",
          "https://www.youtube.com/watch?v=2xiSaJdxzR8",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Zenith Inc",
        gamePlatform: ["Web", "Roblox"],
        applicationCategory: "Game",
        genre: ["Incremental", "Simulator", "Tower", "Clicker"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 1000,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: "0",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/",
        },
      },
      {
        "@type": "VideoObject",
        name: "CLIMB THE TOWER IN ZENITH INC",
        description:
          "Zenith Inc gameplay — climb the tower, upgrade systems, and prestige in this Roblox incremental simulator.",
        uploadDate: "2026-07-20",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/2xiSaJdxzR8",
        url: "https://www.youtube.com/watch?v=2xiSaJdxzR8",
      },
    ],
  };

  // Accordion / interaction state
  const [tipsExpanded, setTipsExpanded] = useState<number | null>(0);
  const [updatesExpanded, setUpdatesExpanded] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid 导航卡片 -> 模块 section id 一一对应
  const toolsSectionIds = [
    "zenith-inc-codes",
    "zenith-inc-beginner-guide",
    "zenith-inc-progression-guide",
    "zenith-inc-upgrade-guide",
    "zenith-inc-currency-guide",
    "zenith-inc-tower-guide",
    "zenith-inc-tips-and-tricks",
    "zenith-inc-updates",
  ];

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(index);
      window.setTimeout(() => setCopiedCode((prev) => (prev === index ? null : prev)), 2000);
    } catch {
      setCopiedCode(null);
    }
  };

  // Tier 配色(Tailwind 语义色板,非硬编码 hex)
  const tierStyle: Record<string, string> = {
    S: "bg-[hsl(var(--nav-theme)/0.15)] border-[hsl(var(--nav-theme)/0.5)] text-[hsl(var(--nav-theme-light))]",
    A: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
    B: "bg-amber-500/10 border-amber-500/40 text-amber-400",
    C: "bg-slate-500/10 border-slate-500/40 text-slate-400",
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner
          type="banner-320x50"
          adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-14 pt-24 md:pb-20 md:pt-32">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center scroll-reveal">
            {/* Badge */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 md:mb-6 md:px-4 md:py-2"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs font-medium md:text-sm">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:mb-6 md:text-7xl">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("zenith-inc-beginner-guide")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--nav-theme))] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[hsl(var(--nav-theme)/0.9)] md:px-8 md:py-4 md:text-lg"
              >
                <BookOpen className="h-5 w-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 text-base font-semibold transition-colors hover:bg-white/10 md:px-8 md:py-4 md:text-lg"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero (max-w-5xl) */}
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl scroll-reveal">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="2xiSaJdxzR8"
              title="CLIMB THE TOWER IN ZENITH INC"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards (max-w-5xl) */}
      <section className="bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center scroll-reveal md:mb-12">
            <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolsSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="group cursor-pointer rounded-xl border border-border bg-card p-4 text-left transition-all duration-300 hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] scroll-reveal md:p-6"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] transition-colors group-hover:bg-[hsl(var(--nav-theme)/0.2)] md:mb-4 md:h-12 md:w-12">
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))] md:h-6 md:w-6"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold md:text-base">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端方形 + 桌面端横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Zenith Inc Codes (code-cards) */}
      <section id="zenith-inc-codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Ticket}
            title={m.zenithIncCodes.title}
            intro={m.zenithIncCodes.intro}
          />
          <div className="mb-6 grid grid-cols-1 gap-3 scroll-reveal md:grid-cols-2 md:gap-4 md:mb-8">
            {m.zenithIncCodes.codes.map((c: any, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <code className="rounded-md border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-[hsl(var(--nav-theme-light))]">
                    {c.code}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(c.code, i)}
                    aria-label={`Copy code ${c.code}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                  >
                    {copiedCode === i ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-3 text-sm font-semibold">{c.reward}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  <Check className="h-3 w-3" /> {c.status}
                </span>
              </div>
            ))}
          </div>
          <p className="rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-4 text-sm text-muted-foreground scroll-reveal md:p-5">
            {m.zenithIncCodes.note}
          </p>
        </div>
      </section>

      {/* Module 2: Zenith Inc Beginner Guide (step-by-step) */}
      <section
        id="zenith-inc-beginner-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={GraduationCap}
            title={m.zenithIncBeginnerGuide.title}
            intro={m.zenithIncBeginnerGuide.intro}
          />
          <div className="mb-8 space-y-3 scroll-reveal md:space-y-4 md:mb-10">
            {m.zenithIncBeginnerGuide.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                  <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1.5 text-lg font-bold md:mb-2 md:text-xl">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground md:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.05)] p-4 scroll-reveal md:p-6">
            <div className="mb-3 flex items-center gap-2 md:mb-4">
              <BookOpen className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="text-base font-bold md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {m.zenithIncBeginnerGuide.quickTips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                  <span className="text-sm text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 3: Zenith Inc Progression Guide (card-list) */}
      <section
        id="zenith-inc-progression-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Rocket}
            title={m.zenithIncProgressionGuide.title}
            intro={m.zenithIncProgressionGuide.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {m.zenithIncProgressionGuide.items.map((item: any, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white/5 p-6 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                  <Rocket className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                </div>
                <h3 className="mb-2 font-bold text-[hsl(var(--nav-theme-light))]">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 4: Zenith Inc Upgrade Guide (tier-grid) */}
      <section
        id="zenith-inc-upgrade-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Zap}
            title={m.zenithIncUpgradeGuide.title}
            intro={m.zenithIncUpgradeGuide.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {m.zenithIncUpgradeGuide.tiers.map((tier: any, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white/5 p-6 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold">{tier.title}</h3>
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold ${tierStyle[tier.tier] || tierStyle.C}`}
                  >
                    {tier.tier}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 4: 中部阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 5: Zenith Inc Currency Guide (table) */}
      <section
        id="zenith-inc-currency-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Coins}
            title={m.zenithIncCurrencyGuide.title}
            intro={m.zenithIncCurrencyGuide.intro}
          />
          {/* 桌面端表格 */}
          <div className="hidden overflow-hidden rounded-xl border border-border scroll-reveal md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[hsl(var(--nav-theme)/0.1)] text-[hsl(var(--nav-theme-light))]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Currency</th>
                  <th className="px-5 py-3 font-semibold">How to Earn</th>
                  <th className="px-5 py-3 font-semibold">Best Used For</th>
                </tr>
              </thead>
              <tbody>
                {m.zenithIncCurrencyGuide.currencies.map((c: any, i: number) => (
                  <tr
                    key={i}
                    className="border-t border-border bg-white/5 align-top"
                  >
                    <td className="px-5 py-4 font-bold text-[hsl(var(--nav-theme-light))]">
                      {c.title}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {c.earning}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{c.usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 移动端卡片 */}
          <div className="space-y-3 scroll-reveal md:hidden">
            {m.zenithIncCurrencyGuide.currencies.map((c: any, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-white/5 p-4"
              >
                <h3 className="mb-2 font-bold text-[hsl(var(--nav-theme-light))]">
                  {c.title}
                </h3>
                <p className="mb-1 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Earn: </span>
                  {c.earning}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Use: </span>
                  {c.usage}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 6: Zenith Inc Tower Guide (card-list) */}
      <section
        id="zenith-inc-tower-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Building2}
            title={m.zenithIncTowerGuide.title}
            intro={m.zenithIncTowerGuide.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {m.zenithIncTowerGuide.floors.map((floor: any, i: number) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl border border-border bg-white/5 p-6 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
              >
                <Building2 className="absolute right-4 top-4 h-8 w-8 text-[hsl(var(--nav-theme)/0.2)]" />
                <h3 className="mb-2 pr-10 font-bold text-[hsl(var(--nav-theme-light))]">
                  {floor.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {floor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 7: Zenith Inc Tips and Tricks (accordion) */}
      <section
        id="zenith-inc-tips-and-tricks"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Lightbulb}
            title={m.zenithIncTipsAndTricks.title}
            intro={m.zenithIncTipsAndTricks.intro}
          />
          <div className="space-y-2 scroll-reveal">
            {m.zenithIncTipsAndTricks.tips.map((tip: any, i: number) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border"
              >
                <button
                  onClick={() =>
                    setTipsExpanded(tipsExpanded === i ? null : i)
                  }
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
                >
                  <span className="font-semibold">{tip.title}</span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform ${tipsExpanded === i ? "rotate-180" : ""}`}
                  />
                </button>
                {tipsExpanded === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground">
                    {tip.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 8: Zenith Inc Updates (accordion) */}
      <section
        id="zenith-inc-updates"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={RefreshCw}
            title={m.zenithIncUpdates.title}
            intro={m.zenithIncUpdates.intro}
          />
          <div className="space-y-2 scroll-reveal">
            {m.zenithIncUpdates.updates.map((u: any, i: number) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-border bg-white/5"
              >
                <button
                  onClick={() =>
                    setUpdatesExpanded(updatesExpanded === i ? null : i)
                  }
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/[0.07]"
                >
                  <span className="flex items-center gap-3 font-semibold">
                    <RefreshCw className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
                    {u.title}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform ${updatesExpanded === i ? "rotate-180" : ""}`}
                  />
                </button>
                {updatesExpanded === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground">
                    {u.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-white/[0.02]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.roblox}{" "}
                    <ExternalLink className="inline h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=2xiSaJdxzR8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.youtube}{" "}
                    <ExternalLink className="inline h-3 w-3" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
