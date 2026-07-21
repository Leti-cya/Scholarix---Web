/**
 * LandingPage.jsx
 * ─────────────────────────────────────────────────────────
 * Location: src/pages/LandingPage.jsx
 *
 * The public-facing marketing page for Scholarix.
 * This is the first thing a visitor sees — its job is to
 * explain what the platform does and convert visitors into
 * registered students or providers.
 *
 * Sections (top to bottom):
 *   1. Navbar
 *   2. Hero
 *   3. Featured Scholarships Preview
 *   4. Platform Benefits
 *   5. How Scholarix Works
 *   6. Statistics
 *   7. Testimonials
 *   8. FAQ
 *   9. Footer
 *
 * No backend calls — all content is mock data defined at
 * the top of this file. In production, scholarships and
 * testimonials would come from an API.
 */

import React, { useState, useEffect } from "react";
import "./LandingPage.css";

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────

/** Featured scholarships shown in the preview strip */
const featuredScholarships = [
  {
    id: 1,
    name: "Gates Cambridge Scholarship",
    provider: "University of Cambridge",
    country: "🇬🇧 United Kingdom",
    amount: "$60,000 / year",
    level: "Postgraduate",
    field: "All Fields",
    deadline: "12 Dec 2026",
    tag: "Full Funding",
    tagColor: "tag-blue",
    logo: "GC",
    logoColor: "logo-blue",
  },
  {
    id: 2,
    name: "Chevening Scholarship",
    provider: "UK Foreign, Commonwealth & Development Office",
    country: "🇬🇧 United Kingdom",
    amount: "$45,000 / year",
    level: "Masters",
    field: "All Fields",
    deadline: "05 Nov 2026",
    tag: "Fully Funded",
    tagColor: "tag-green",
    logo: "CH",
    logoColor: "logo-green",
  },
  {
    id: 3,
    name: "DAAD Research Fellowship",
    provider: "German Academic Exchange Service",
    country: "🇩🇪 Germany",
    amount: "€24,000 / year",
    level: "PhD",
    field: "STEM & Research",
    deadline: "31 Oct 2026",
    tag: "Research",
    tagColor: "tag-purple",
    logo: "DA",
    logoColor: "logo-purple",
  },
  {
    id: 4,
    name: "Aga Khan Foundation Award",
    provider: "Aga Khan Foundation International",
    country: "🌍 Global",
    amount: "$30,000 / year",
    level: "Masters",
    field: "Development",
    deadline: "15 Nov 2026",
    tag: "Need-Based",
    tagColor: "tag-gold",
    logo: "AK",
    logoColor: "logo-gold",
  },
  {
    id: 5,
    name: "NSF Graduate Research Fellowship",
    provider: "National Science Foundation",
    country: "🇺🇸 United States",
    amount: "$37,000 / year",
    level: "Graduate",
    field: "STEM",
    deadline: "13 Jun 2026",
    tag: "STEM Focus",
    tagColor: "tag-blue",
    logo: "NS",
    logoColor: "logo-blue",
  },
  {
    id: 6,
    name: "Erasmus Mundus Joint Master",
    provider: "European Commission",
    country: "🇪🇺 European Union",
    amount: "€25,200 / year",
    level: "Masters",
    field: "All Fields",
    deadline: "20 Jan 2027",
    tag: "EU Funded",
    tagColor: "tag-teal",
    logo: "EM",
    logoColor: "logo-teal",
  },
];

/** Platform benefit cards */
const benefits = [
  {
    id: 1,
    icon: "🎯",
    title: "Matched to your profile",
    body: "Our algorithm compares your academic background, field, and country against thousands of scholarships — then ranks them by your likelihood of success. No more irrelevant listings.",
  },
  {
    id: 2,
    icon: "⚡",
    title: "Apply once, reach many",
    body: "Build your profile once. Scholarix auto-fills your information into every application form, cutting the time to apply from hours to minutes.",
  },
  {
    id: 3,
    icon: "🔔",
    title: "Never miss a deadline",
    body: "Deadline reminders arrive 7 days, 3 days, and 1 day before each closing date — by email and in-app. Sync directly to Google Calendar with one click.",
  },
  {
    id: 4,
    icon: "🔒",
    title: "Verified scholarships only",
    body: "Every provider is verified before listing. Zero-tolerance for fraudulent postings. Every scholarship you see on Scholarix is real, active, and legitimate.",
  },
  {
    id: 5,
    icon: "📊",
    title: "Track every application",
    body: "A live dashboard shows exactly where each application stands — submitted, under review, shortlisted, or awarded — in real time.",
  },
  {
    id: 6,
    icon: "💸",
    title: "Free for students, always",
    body: "Applying for a scholarship should never cost money. Scholarix is completely free for students. Providers pay a listing fee — not you.",
  },
];

/** Steps for the "How it works" process section */
const steps = [
  {
    id: 1,
    step: "1",
    title: "Create your profile",
    body: "Fill in your academic background, field of study, and nationality. Upload your CV and personal statement once — they're reused everywhere.",
    icon: "👤",
  },
  {
    id: 2,
    step: "2",
    title: "See your matches",
    body: "Our matching engine surfaces scholarships ranked by how well you qualify. Filter by amount, deadline, level, or country.",
    icon: "🔍",
  },
  {
    id: 3,
    step: "3",
    title: "Apply in minutes",
    body: "Your profile pre-fills each application. Write your answers once and apply to multiple scholarships without starting over.",
    icon: "✍️",
  },
  {
    id: 4,
    step: "4",
    title: "Track and receive",
    body: "Follow every application through each stage. Get notified the moment a provider shortlists you or issues an award decision.",
    icon: "🏆",
  },
];

/** Platform statistics displayed in the stats strip */
const stats = [
  { id: 1, value: "120K+", label: "Registered students" },
  { id: 2, value: "18,400", label: "Active scholarships" },
  { id: 3, value: "$4.2B", label: "Funds awarded to date" },
  { id: 4, value: "94%", label: "Match accuracy" },
];

/** Student testimonials */
const testimonials = [
  {
    id: 1,
    quote:
      "Scholarix matched me with five scholarships I would never have found on my own. I won two of them and funded my entire MSc without any debt.",
    name: "Aisha Kamara",
    role: "MSc Economics · London School of Economics",
    country: "Sierra Leone",
    avatar: "AK",
    avatarColor: "av-blue",
    stars: 5,
  },
  {
    id: 2,
    quote:
      "The one-click apply feature saved me dozens of hours. The deadline reminders are genuinely useful — I never had to remember a date myself.",
    name: "Kenji Watanabe",
    role: "PhD Computer Science · MIT",
    country: "Japan",
    avatar: "KW",
    avatarColor: "av-green",
    stars: 5,
  },
  {
    id: 3,
    quote:
      "As a first-generation student, navigating scholarships felt impossible. Scholarix made it manageable. I graduated completely debt-free.",
    name: "Sofia Mendes",
    role: "BEng Engineering · Stanford University",
    country: "Brazil",
    avatar: "SM",
    avatarColor: "av-purple",
    stars: 5,
  },
];

/** FAQ questions and answers */
const faqs = [
  {
    id: 1,
    question: "Is Scholarix free for students?",
    answer:
      "Yes — completely free, with no hidden charges. Creating a profile, browsing scholarships, and submitting applications costs nothing. Scholarship providers pay a platform fee to list their programs.",
  },
  {
    id: 2,
    question: "How does the matching algorithm work?",
    answer:
      "The algorithm compares your academic level, field of study, nationality, GPA, and profile completeness against each scholarship's eligibility criteria. It then ranks results by your probability of success — not just by amount or deadline.",
  },
  {
    id: 3,
    question: "Can I apply to scholarships outside my home country?",
    answer:
      "Absolutely. Scholarix lists international scholarships from over 80 countries. Many providers specifically seek candidates from diverse global backgrounds.",
  },
  {
    id: 4,
    question: "How long does an application take?",
    answer:
      "Your first application takes around 20 minutes to complete your profile. After that, most applications take under 5 minutes because Scholarix auto-fills your saved information.",
  },
  {
    id: 5,
    question: "Are all scholarship providers verified?",
    answer:
      "Yes. Every provider goes through identity verification and a manual review before their listing goes live. We maintain a zero-tolerance policy for fraudulent scholarships.",
  },
  {
    id: 6,
    question: "I'm a scholarship provider — how do I list my program?",
    answer:
      "Register as a provider, complete your organisation profile, then use the Create Scholarship wizard. Your listing is reviewed within 48 hours and goes live once approved.",
  },
];

// ─────────────────────────────────────────────────────────
// SMALL SUB-COMPONENTS
// Each section of the page is its own component so the main
// LandingPage export stays readable and easy to navigate.
// ─────────────────────────────────────────────────────────

/**
 * Navbar
 * Sticky at the top. Adds a scrolled shadow once the user
 * scrolls past 20px. Collapses to a hamburger on mobile.
 */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Listen for scroll to add a shadow to the nav
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when the user clicks a link
  function handleNavLink() {
    setMenuOpen(false);
  }

  return (
    <nav className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`} role="navigation" aria-label="Main navigation">
      <div className="lp-nav__inner">
        {/* Logo */}
        <a href="#hero" className="lp-nav__logo" aria-label="Scholarix home">
          <span className="lp-nav__logo-mark" aria-hidden="true">SX</span>
          <span className="lp-nav__logo-text">Scholarix</span>
        </a>

        {/* Desktop links */}
        <ul className="lp-nav__links" role="list">
          <li><a href="#scholarships" className="lp-nav__link">Scholarships</a></li>
          <li><a href="#how-it-works" className="lp-nav__link">How it works</a></li>
          <li><a href="#benefits" className="lp-nav__link">Benefits</a></li>
          <li><a href="#faq" className="lp-nav__link">FAQ</a></li>
        </ul>

        {/* Desktop CTA buttons */}
        <div className="lp-nav__actions">
          <a href="/login" className="lp-btn lp-btn--ghost">Sign in</a>
          <a href="/register" className="lp-btn lp-btn--primary">Get started free</a>
        </div>

        {/* Mobile hamburger toggle */}
        <button
          className="lp-nav__hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <span className={`lp-hamburger-bar ${menuOpen ? "bar--open" : ""}`} aria-hidden="true" />
          <span className={`lp-hamburger-bar ${menuOpen ? "bar--open" : ""}`} aria-hidden="true" />
          <span className={`lp-hamburger-bar ${menuOpen ? "bar--open" : ""}`} aria-hidden="true" />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="lp-nav__mobile-menu" id="mobile-menu" role="dialog" aria-label="Mobile navigation menu">
          <ul role="list">
            <li><a href="#scholarships" onClick={handleNavLink} className="lp-nav__mobile-link">Scholarships</a></li>
            <li><a href="#how-it-works" onClick={handleNavLink} className="lp-nav__mobile-link">How it works</a></li>
            <li><a href="#benefits" onClick={handleNavLink} className="lp-nav__mobile-link">Benefits</a></li>
            <li><a href="#faq" onClick={handleNavLink} className="lp-nav__mobile-link">FAQ</a></li>
          </ul>
          <div className="lp-nav__mobile-actions">
            <a href="/login" className="lp-btn lp-btn--ghost lp-btn--full" onClick={handleNavLink}>Sign in</a>
            <a href="/register" className="lp-btn lp-btn--primary lp-btn--full" onClick={handleNavLink}>Get started free</a>
          </div>
        </div>
      )}
    </nav>
  );
}

/**
 * HeroSection
 * The page's opening statement. The headline names the benefit
 * directly ("Free scholarships — matched to you"), supported by
 * a search bar and three social-proof counters below.
 * The floating stat cards on the right are the signature
 * visual element — they show live-feel data without needing a
 * real data source.
 */
function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLevel, setSearchLevel] = useState("All Levels");

  function handleSearch(e) {
    e.preventDefault();
    // In production: navigate to /browse?q=searchQuery&level=searchLevel
    console.log("Search:", searchQuery, searchLevel);
  }

  return (
    <section className="lp-hero" id="hero" aria-labelledby="hero-heading">
      {/* Background decorative blobs — purely visual */}
      <div className="lp-hero__blob lp-hero__blob--1" aria-hidden="true" />
      <div className="lp-hero__blob lp-hero__blob--2" aria-hidden="true" />

      <div className="lp-container lp-hero__inner">
        {/* Left: headline + search */}
        <div className="lp-hero__content">
          {/* Trust badge */}
          <div className="lp-hero__badge" aria-label="Platform trust indicator">
            <span className="lp-hero__badge-dot" aria-hidden="true" />
            Trusted by 120,000+ students in 80+ countries
          </div>

          <h1 className="lp-hero__heading" id="hero-heading">
            Free scholarships,<br />
            matched to <span className="lp-hero__heading-accent">you</span>.
          </h1>

          <p className="lp-hero__sub">
            Scholarix connects ambitious students with global funding opportunities.
            Build your profile once — we match you with the scholarships you're
            most likely to win, automatically.
          </p>

          {/* Search bar */}
          <form className="lp-hero__search" onSubmit={handleSearch} role="search" aria-label="Search scholarships">
            <div className="lp-hero__search-inner">
              <span className="lp-hero__search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                className="lp-hero__search-input"
                placeholder="Search by field, country, or keyword…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search scholarships"
              />
              <div className="lp-hero__search-divider" aria-hidden="true" />
              <select
                className="lp-hero__search-select"
                value={searchLevel}
                onChange={(e) => setSearchLevel(e.target.value)}
                aria-label="Filter by education level"
              >
                <option>All Levels</option>
                <option>Undergraduate</option>
                <option>Masters</option>
                <option>PhD</option>
              </select>
              <button type="submit" className="lp-btn lp-btn--primary lp-hero__search-btn">
                Search
              </button>
            </div>
            {/* Popular search tags */}
            <div className="lp-hero__search-tags" aria-label="Popular search tags">
              <span className="lp-hero__tags-label">Popular:</span>
              {["STEM", "UK Scholarships", "Need-Based", "Full Funding", "PhD"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="lp-tag-pill"
                  onClick={() => setSearchQuery(tag)}
                  aria-label={`Search for ${tag}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Right: decorative stat cards */}
        <div className="lp-hero__visual" aria-hidden="true">
          {/* Main card */}
          <div className="lp-hero__card lp-hero__card--main">
            <div className="lp-hero__card-eyebrow">Matched for you</div>
            <div className="lp-hero__card-value">247</div>
            <div className="lp-hero__card-label">scholarships this week</div>
            <div className="lp-hero__card-bar-row">
              <div className="lp-hero__card-bar" style={{ width: "80%", background: "var(--lp-blue)" }} />
              <div className="lp-hero__card-bar" style={{ width: "60%", background: "var(--lp-gold)" }} />
              <div className="lp-hero__card-bar" style={{ width: "45%", background: "var(--lp-teal)" }} />
            </div>
          </div>

          {/* Floating award card */}
          <div className="lp-hero__card lp-hero__card--award">
            <span className="lp-hero__card-emoji">🏆</span>
            <div>
              <div className="lp-hero__card-award-title">Latest award</div>
              <div className="lp-hero__card-award-name">Priya M. — MIT Engineering</div>
              <div className="lp-hero__card-award-amount">$45,000 received</div>
            </div>
          </div>

          {/* Floating deadline card */}
          <div className="lp-hero__card lp-hero__card--deadline">
            <span className="lp-hero__card-emoji">⏰</span>
            <div>
              <div className="lp-hero__card-deadline-label">Closing soon</div>
              <div className="lp-hero__card-deadline-name">NSF Fellowship</div>
              <div className="lp-hero__card-deadline-days">2 days left</div>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof numbers below hero content */}
      <div className="lp-container">
        <div className="lp-hero__proof" role="list" aria-label="Platform statistics">
          {[
            { value: "$4.2B", label: "Awarded to students" },
            { value: "18,400+", label: "Active scholarships" },
            { value: "120K+", label: "Students registered" },
          ].map((item) => (
            <div key={item.label} className="lp-hero__proof-item" role="listitem">
              <span className="lp-hero__proof-value">{item.value}</span>
              <span className="lp-hero__proof-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * ScholarshipCard
 * Used inside the Featured Scholarships section.
 * Shows the key information a student needs to decide whether
 * to click through: name, provider, amount, deadline, and level.
 */
function ScholarshipCard({ scholarship: s }) {
  return (
    <article className="lp-schol-card" aria-label={s.name}>
      {/* Top colour strip + logo */}
      <div className={`lp-schol-card__top ${s.logoColor}`}>
        <div className="lp-schol-card__logo" aria-hidden="true">{s.logo}</div>
        <span className={`lp-schol-tag ${s.tagColor}`}>{s.tag}</span>
      </div>

      <div className="lp-schol-card__body">
        <h3 className="lp-schol-card__name">{s.name}</h3>
        <p className="lp-schol-card__provider">{s.provider}</p>
        <p className="lp-schol-card__country">{s.country}</p>

        <div className="lp-schol-card__meta">
          <span className="lp-schol-card__meta-pill">{s.level}</span>
          <span className="lp-schol-card__meta-pill">{s.field}</span>
        </div>

        <div className="lp-schol-card__footer">
          <div className="lp-schol-card__amount">{s.amount}</div>
          <div className="lp-schol-card__deadline">⏰ {s.deadline}</div>
        </div>

        <a href="/register" className="lp-btn lp-btn--primary lp-btn--full lp-schol-card__cta">
          Apply now
        </a>
      </div>
    </article>
  );
}

/**
 * FeaturedScholarshipsSection
 * Six scholarship cards in a responsive grid.
 * The section header has a right-aligned "Browse all" link.
 */
function FeaturedScholarshipsSection() {
  return (
    <section className="lp-section lp-section--gray" id="scholarships" aria-labelledby="scholarships-heading">
      <div className="lp-container">
        <div className="lp-section__header">
          <div>
            <p className="lp-eyebrow">Featured Opportunities</p>
            <h2 className="lp-section__title" id="scholarships-heading">
              High-value scholarships<br />open right now
            </h2>
          </div>
          <a href="/browse" className="lp-btn lp-btn--ghost lp-section__header-link">
            Browse all 18,400 →
          </a>
        </div>

        <div className="lp-schol-grid" role="list" aria-label="Featured scholarships">
          {featuredScholarships.map((s) => (
            <div key={s.id} role="listitem">
              <ScholarshipCard scholarship={s} />
            </div>
          ))}
        </div>

        <div className="lp-schol-cta-row">
          <a href="/register" className="lp-btn lp-btn--primary lp-btn--lg">
            Create a free account to see your matches
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * BenefitsSection
 * Six benefit cards explaining why a student should use
 * Scholarix over searching manually. Icons are emoji —
 * in production these would be SVG icons.
 */
function BenefitsSection() {
  return (
    <section className="lp-section" id="benefits" aria-labelledby="benefits-heading">
      <div className="lp-container">
        <div className="lp-section__header lp-section__header--centered">
          <p className="lp-eyebrow">Why Scholarix</p>
          <h2 className="lp-section__title" id="benefits-heading">
            Everything the scholarship search<br />process was missing
          </h2>
          <p className="lp-section__sub">
            Most students spend 40+ hours on scholarship searches that produce
            little. Scholarix cuts that to under an hour — and dramatically
            improves your chances.
          </p>
        </div>

        <div className="lp-benefits-grid" role="list" aria-label="Platform benefits">
          {benefits.map((b) => (
            <div key={b.id} className="lp-benefit-card" role="listitem">
              <div className="lp-benefit-card__icon" aria-hidden="true">{b.icon}</div>
              <h3 className="lp-benefit-card__title">{b.title}</h3>
              <p className="lp-benefit-card__body">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * HowItWorksSection
 * A four-step horizontal timeline on desktop, stacked on mobile.
 * Steps are numbered 1–4 because the content genuinely is a
 * sequence — order carries information the student needs.
 */
function HowItWorksSection() {
  return (
    <section className="lp-section lp-section--navy" id="how-it-works" aria-labelledby="hiw-heading">
      <div className="lp-container">
        <div className="lp-section__header lp-section__header--centered">
          <p className="lp-eyebrow lp-eyebrow--light">How it works</p>
          <h2 className="lp-section__title lp-section__title--light" id="hiw-heading">
            From sign-up to scholarship<br />in four steps
          </h2>
          <p className="lp-section__sub lp-section__sub--light">
            Most students complete their first application within 30 minutes of creating an account.
          </p>
        </div>

        {/* Step connector line (visible on desktop) */}
        <div className="lp-steps-wrapper" role="list" aria-label="Steps to apply">
          <div className="lp-steps-line" aria-hidden="true" />
          {steps.map((step) => (
            <div key={step.id} className="lp-step" role="listitem">
              {/* Step number bubble */}
              <div className="lp-step__number" aria-label={`Step ${step.step}`}>
                {step.step}
              </div>
              <div className="lp-step__icon" aria-hidden="true">{step.icon}</div>
              <h3 className="lp-step__title">{step.title}</h3>
              <p className="lp-step__body">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="lp-section__cta-row">
          <a href="/register" className="lp-btn lp-btn--gold lp-btn--lg">
            Start my profile — it's free
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * StatsSection
 * Four large numbers that build credibility.
 * Kept deliberately minimal — the numbers do the work.
 */
function StatsSection() {
  return (
    <section className="lp-stats-strip" aria-label="Platform statistics">
      <div className="lp-container">
        <dl className="lp-stats-grid" role="list">
          {stats.map((s) => (
            <div key={s.id} className="lp-stat" role="listitem">
              <dt className="lp-stat__value">{s.value}</dt>
              <dd className="lp-stat__label">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * TestimonialsSection
 * Three student stories. Real names and institutions are
 * used (realistic mock data) to build credibility.
 * Star ratings are rendered as Unicode stars for accessibility.
 */
function TestimonialsSection() {
  return (
    <section className="lp-section" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="lp-container">
        <div className="lp-section__header lp-section__header--centered">
          <p className="lp-eyebrow">Student Stories</p>
          <h2 className="lp-section__title" id="testimonials-heading">
            Students who found their funding
          </h2>
        </div>

        <div className="lp-testimonials-grid" role="list" aria-label="Student testimonials">
          {testimonials.map((t) => (
            <article key={t.id} className="lp-testimonial-card" role="listitem" aria-label={`Testimonial from ${t.name}`}>
              {/* Star rating */}
              <div className="lp-testimonial-stars" aria-label={`${t.stars} out of 5 stars`}>
                {"★".repeat(t.stars)}
                {"☆".repeat(5 - t.stars)}
              </div>

              <blockquote className="lp-testimonial-quote">
                <p>"{t.quote}"</p>
              </blockquote>

              <div className="lp-testimonial-author">
                <div className={`lp-testimonial-avatar ${t.avatarColor}`} aria-hidden="true">
                  {t.avatar}
                </div>
                <div>
                  <div className="lp-testimonial-name">{t.name}</div>
                  <div className="lp-testimonial-role">{t.role}</div>
                  <div className="lp-testimonial-country">📍 {t.country}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * FAQItem
 * An individual FAQ row with expand/collapse behaviour.
 * Uses local state so each item opens independently.
 */
function FAQItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`lp-faq-item ${open ? "lp-faq-item--open" : ""}`}>
      <button
        className="lp-faq-question"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`faq-answer-${item.id}`}
        id={`faq-btn-${item.id}`}
      >
        <span>{item.question}</span>
        <span className="lp-faq-icon" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div
          className="lp-faq-answer"
          id={`faq-answer-${item.id}`}
          role="region"
          aria-labelledby={`faq-btn-${item.id}`}
        >
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
}

/**
 * FAQSection
 * Two-column layout on desktop: heading/intro on the left,
 * accordion items on the right. Collapses to one column on mobile.
 */
function FAQSection() {
  return (
    <section className="lp-section lp-section--gray" id="faq" aria-labelledby="faq-heading">
      <div className="lp-container">
        <div className="lp-faq-layout">
          {/* Left: heading */}
          <div className="lp-faq-intro">
            <p className="lp-eyebrow">FAQ</p>
            <h2 className="lp-section__title" id="faq-heading">
              Common questions answered
            </h2>
            <p className="lp-faq-intro__sub">
              Everything you need to know before creating your account. Can't
              find an answer? Our support team responds within 24 hours.
            </p>
            <a href="/support" className="lp-btn lp-btn--primary lp-faq-intro__cta">
              Contact support
            </a>
          </div>

          {/* Right: accordion */}
          <div className="lp-faq-list" role="list" aria-label="Frequently asked questions">
            {faqs.map((item) => (
              <FAQItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * CTABanner
 * A full-width conversion banner placed before the footer.
 * The page's most direct ask: "sign up now".
 */
function CTABanner() {
  return (
    <section className="lp-cta-banner" aria-labelledby="cta-heading">
      {/* Decorative circles */}
      <div className="lp-cta-banner__circle lp-cta-banner__circle--1" aria-hidden="true" />
      <div className="lp-cta-banner__circle lp-cta-banner__circle--2" aria-hidden="true" />

      <div className="lp-container lp-cta-banner__inner">
        <h2 className="lp-cta-banner__title" id="cta-heading">
          Your next scholarship is waiting.
        </h2>
        <p className="lp-cta-banner__sub">
          Join 120,000 students who've already found their match.
          It takes 10 minutes to set up your profile.
        </p>
        <div className="lp-cta-banner__actions">
          <a href="/register" className="lp-btn lp-btn--gold lp-btn--lg">
            Get started — it's free
          </a>
          <a href="/browse" className="lp-btn lp-btn--outline-white lp-btn--lg">
            Browse scholarships first
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * Footer
 * Four-column grid with links, a brief mission statement,
 * and legal links in the bottom bar.
 */
function Footer() {
  const columns = [
    {
      heading: "Platform",
      links: [
        { label: "Browse Scholarships", href: "/browse" },
        { label: "For Students", href: "/students" },
        { label: "For Providers", href: "/providers" },
        { label: "Pricing", href: "/pricing" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Application Guide", href: "/guide" },
        { label: "Essay Templates", href: "/essays" },
        { label: "Webinars", href: "/webinars" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About us", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="lp-footer" role="contentinfo">
      <div className="lp-container">
        <div className="lp-footer__grid">
          {/* Brand column */}
          <div className="lp-footer__brand">
            <a href="/" className="lp-nav__logo lp-footer__logo" aria-label="Scholarix home">
              <span className="lp-nav__logo-mark" aria-hidden="true">SX</span>
              <span className="lp-nav__logo-text lp-footer__logo-text">Scholarix</span>
            </a>
            <p className="lp-footer__brand-sub">
              Connecting ambitious students with the funding they deserve —
              globally, fairly, and free.
            </p>
            <div className="lp-footer__socials" aria-label="Social media links">
              {["𝕏", "in", "f"].map((icon) => (
                <a key={icon} href="#" className="lp-footer__social-btn" aria-label={`Follow us on ${icon}`}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.heading} className="lp-footer__col">
              <h3 className="lp-footer__col-heading">{col.heading}</h3>
              <ul className="lp-footer__link-list" role="list">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="lp-footer__link">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="lp-footer__bottom">
          <p className="lp-footer__copyright">© 2026 Scholarix Inc. All rights reserved.</p>
          <div className="lp-footer__legal">
            <a href="/privacy" className="lp-footer__legal-link">Privacy Policy</a>
            <a href="/terms" className="lp-footer__legal-link">Terms of Service</a>
            <a href="/cookies" className="lp-footer__legal-link">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN EXPORT
// Composes all sections top-to-bottom in page order.
// ─────────────────────────────────────────────────────────

/**
 * LandingPage
 * ─────────────────────────────────────────────────────────
 * The public marketing page. No authentication required.
 * Renders every section as a named sub-component to keep
 * this root component clean and easy to scan.
 */
export default function LandingPage() {
  return (
    <div className="lp-root">
      {/* 1 — Sticky navbar */}
      <Navbar />

      <main id="main-content">
        {/* 2 — Hero with search */}
        <HeroSection />

        {/* 3 — Featured scholarships grid */}
        <FeaturedScholarshipsSection />

        {/* 4 — Six platform benefit cards */}
        <BenefitsSection />

        {/* 5 — Four-step "how it works" process */}
        <HowItWorksSection />

        {/* 6 — Platform stat strip */}
        <StatsSection />

        {/* 7 — Student testimonials */}
        <TestimonialsSection />

        {/* 8 — FAQ accordion */}
        <FAQSection />

        {/* 9 — Conversion banner before footer */}
        <CTABanner />
      </main>

      {/* 10 — Footer */}
      <Footer />
    </div>
  );
}