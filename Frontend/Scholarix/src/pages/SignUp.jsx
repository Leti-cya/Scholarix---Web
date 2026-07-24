import React, { useState } from "react";
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";

import "./Auth.css";
import { registerUser, checkEmailExists } from "../service/Api";
import ThemeToggle from "../component/ThemeToggle";

const STEP_LABELS = {
  student:  ["Account",    "Personal",  "Academic"],
  provider: ["Account",    "Your Org",  "Verify"],
  default:  ["Account",    "Details",   "Finish"],
};

const LEFT_COPY = {
  default: {
    eyebrow: "Join Scholarix",
    heading: "Find funding\nthat fits\nyou.",
    sub: "Free for students. Set up in minutes.",
    features: [
      "AI-matched scholarships in seconds",
      "Auto-fill saves hours per application",
      "Deadline reminders — never miss out",
      "Track every application in one place",
    ],
  },
  student: {
    eyebrow: "Student account",
    heading: "Your next\nscholarship\nstarts here.",
    sub: "Build your profile once, apply everywhere.",
    features: [
      "AI-matched scholarships in seconds",
      "Auto-fill saves hours per application",
      "Deadline reminders — never miss out",
      "Track every application in one place",
    ],
  },
  provider: {
    eyebrow: "Provider account",
    heading: "Reach the right\nstudents,\nfast.",
    sub: "Surface your scholarship to pre-matched candidates.",
    features: [
      "Verified student profiles only",
      "Eligibility filtering built-in",
      "Applicant pipeline dashboard",
      "Analytics on reach and engagement",
    ],
  },
};

const COUNTRIES = [
  "Select country",
  "Australia", "Bangladesh", "Brazil", "Canada", "China",
  "Egypt", "Ethiopia", "France", "Germany", "Ghana",
  "India", "Indonesia", "Japan", "Kenya", "Mexico",
  "Nepal", "Nigeria", "Pakistan", "Philippines", "Sierra Leone",
  "South Africa", "South Korea", "Sri Lanka", "Tanzania", "Uganda",
  "United Kingdom", "United States", "Vietnam", "Zimbabwe", "Other",
];

const LEVELS = [
  "Select level",
  "High School / Secondary",
  "Undergraduate (Bachelor's)",
  "Postgraduate (Master's)",
  "Doctoral (PhD)",
  "Postdoctoral",
  "Vocational / Certificate",
];

const FIELDS = [
  "Select field",
  "Arts & Humanities",
  "Business & Management",
  "Computer Science & IT",
  "Education",
  "Engineering & Technology",
  "Environment & Sustainability",
  "Law",
  "Medicine & Health",
  "Natural Sciences",
  "Social Sciences",
  "Other",
];

const ORG_TYPES = [
  "Select type",
  "University / Academic Institution",
  "Non-profit Foundation",
  "Government Body",
  "Corporate / Private Company",
  "International Organisation",
  "Other",
];



/**
 * Calculates password strength score (0-4)
 * based on length, uppercase letters,
 * numbers, and special characters.
 */
function passwordStrength(pw = "") {
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABELS = ["Too short", "Weak",      "Fair",          "Good",          "Strong"];
const STRENGTH_COLORS = ["",          "var(--auth-red)", "var(--auth-amber)", "var(--auth-teal)", "var(--auth-green)"];

function LeftPanel({ role, step }) {
  const copy  = LEFT_COPY[role] || LEFT_COPY.default;
  // On steps 2–3 we show a compact panel; on step 1 show full features
  const compact = step > 1;

  return (
    <div className="auth-left auth-left--light">
      <a href="/" className="auth-logo" aria-label="Back to Scholarix home">
        <span className="auth-logo__mark" aria-hidden="true">SX</span>
        <span className="auth-logo__text">Scholarix</span>
      </a>

      <div className="auth-left__body">
        <p className="auth-left__eyebrow">{copy.eyebrow}</p>

        <h1 className="auth-left__heading">
          {copy.heading.split("\n").map((line, i, arr) =>
            i === arr.length - 1
              ? <span key={i} className="auth-left__heading-accent">{line}</span>
              : <span key={i}>{line}<br /></span>
          )}
        </h1>

        <p className="auth-left__sub">{copy.sub}</p>

        {!compact && (
          <ul className="auth-left__features" aria-label="Account benefits">
            {copy.features.map((f, i) => (
              <li key={i} className="auth-left__feature">
                <span className="auth-left__feature-check" aria-hidden="true">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/*
         * Compact step indicator for steps 2–3.
         * Reminds the user which step they're on without
         * showing the full progress bar (which is on the right).
         */}
        {compact && (
          <div className="signup-left__step-indicator" aria-hidden="true">
            <span className="signup-left__step-dot step-done" />
            <span className="signup-left__step-dot step-done" />
            <span className={`signup-left__step-dot ${step === 3 ? "step-active" : ""}`} />
          </div>
        )}

        <div className="auth-left__trust">
          <div className="auth-trust-item">
            <span className="auth-trust-value">120K+</span>
            <span className="auth-trust-label">Students</span>
          </div>
          <div className="auth-trust-divider" aria-hidden="true" />
          <div className="auth-trust-item">
            <span className="auth-trust-value">$4.2B</span>
            <span className="auth-trust-label">Awarded</span>
          </div>
          <div className="auth-trust-divider" aria-hidden="true" />
          <div className="auth-trust-item">
            <span className="auth-trust-value">18K+</span>
            <span className="auth-trust-label">Scholarships</span>
          </div>
        </div>

      </div>

      <p className="auth-left__foot">© 2026 Scholarix Inc.</p>
    </div>
  );
}

function ProgressBar({ step, role }) {
  const labels = STEP_LABELS[role] || STEP_LABELS.default;

  return (
    <div
      className="auth-progress"
      role="navigation"
      aria-label={`Registration step ${step} of 3`}
    >
      <div className="auth-progress__bars">
        {labels.map((label, i) => {
          const n      = i + 1;
          const active = n === step;
          const done   = n < step;
          return (
            <div
              key={n}
              className={`auth-progress__segment ${done ? "seg--done" : ""} ${active ? "seg--active" : ""}`}
              aria-current={active ? "step" : undefined}
            >
              <div className="auth-progress__bar" />
              <span className="auth-progress__label">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Step1Account({ role, onRoleChange, data, onChange, onNext }) {
  const [errors,   setErrors]  = useState({});
  const [showPass, setShowPass] = useState(false);
  const [checking, setChecking] = useState(false);

  const level  = passwordStrength(data.password || "");

  function field(key, value) { onChange({ ...data, [key]: value }); }

  /**
   * Validates account creation fields
   * before allowing the user to proceed
   * to the next registration step.
   */
  function validate() {
    const errs = {};
    if (!data.email?.trim())
      errs.email = "Email address is required.";
    else if (!/\S+@\S+\.\S+/.test(data.email))
      errs.email = "Enter a valid email address.";
    if (!data.password)
      errs.password = "Password is required.";
    else if (data.password.length < 8)
      errs.password = "At least 8 characters.";
    if (!data.terms)
      errs.terms = "Please accept the terms to continue.";
    return errs;
  }

  async function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    
    setChecking(true);
    try {
      const response = await checkEmailExists(data.email);
      if (response.data.exists) {
        setErrors({ email: "An account with this email already exists." });
      } else {
        onNext();
      }
    } catch (error) {
      toast.error("Failed to check email availability.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="auth-form-panel">
      <ProgressBar step={1} role={role} />

      <h2 className="auth-form__heading">Create your account</h2>
      <p className="auth-form__sub">
        Already registered?{" "}
        <a href="/login" className="auth-switch__link">Sign in →</a>
      </p>

      <div className="signup-role-toggle" role="group" aria-label="Account type">
        <button
          type="button"
          className={`signup-role-btn ${role === "student" ? "signup-role-btn--active" : ""}`}
          onClick={() => onRoleChange("student")}
          aria-pressed={role === "student"}
        >
          🎓 Student
        </button>
        <button
          type="button"
          className={`signup-role-btn ${role === "provider" ? "signup-role-btn--active" : ""}`}
          onClick={() => onRoleChange("provider")}
          aria-pressed={role === "provider"}
        >
          🏢 Provider
        </button>
      </div>



      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s1-email">Email address</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">✉</span>
          <input
            id="s1-email"
            type="email"
            className={`auth-field__input auth-field__input--icon ${errors.email ? "auth-field__input--error" : ""}`}
            placeholder="you@university.edu"
            value={data.email || ""}
            onChange={(e) => { field("email", e.target.value); setErrors(p => ({...p, email: ""})); }}
            autoComplete="email"
            autoFocus
          />
        </div>
        {errors.email && <p className="auth-field__error" role="alert">{errors.email}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s1-pass">Password</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">🔒</span>
          <input
            id="s1-pass"
            type={showPass ? "text" : "password"}
            className={`auth-field__input auth-field__input--icon ${errors.password ? "auth-field__input--error" : ""}`}
            placeholder="Min. 8 characters"
            value={data.password || ""}
            onChange={(e) => { field("password", e.target.value); setErrors(p => ({...p, password: ""})); }}
            autoComplete="new-password"
            aria-describedby="s1-strength"
          />
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setShowPass(s => !s)}
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>

        {/* Strength meter — appears as soon as user starts typing */}
        {(data.password || "").length > 0 && (
          <div className="auth-strength" id="s1-strength" aria-live="polite">
            <div className="auth-strength__bars" aria-hidden="true">
              {[1, 2, 3, 4].map(n => (
                <div
                  key={n}
                  className="auth-strength__bar"
                  style={{ background: n <= level ? STRENGTH_COLORS[level] : "var(--auth-border)" }}
                />
              ))}
            </div>
            <span className="auth-strength__label" style={{ color: STRENGTH_COLORS[level] }}>
              {STRENGTH_LABELS[level]}
            </span>
          </div>
        )}
        {errors.password && <p className="auth-field__error" role="alert">{errors.password}</p>}
      </div>

      <label className="auth-checkbox" htmlFor="s1-terms">
        <input
          id="s1-terms"
          type="checkbox"
          className="auth-checkbox__input"
          checked={data.terms || false}
          onChange={(e) => { field("terms", e.target.checked); setErrors(p => ({...p, terms: ""})); }}
        />
        <span className="auth-checkbox__box" aria-hidden="true" />
        <span className="auth-checkbox__label">
          I agree to the{" "}
          <a href="/terms" className="auth-switch__link" target="_blank" rel="noopener noreferrer">Terms</a>
          {" "}and{" "}
          <a href="/privacy" className="auth-switch__link" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </span>
      </label>
      {errors.terms && <p className="auth-field__error" role="alert" style={{marginTop: "4px"}}>{errors.terms}</p>}

      <button
        type="button"
        className="auth-btn auth-btn--primary auth-btn--full"
        onClick={handleNext}
        disabled={checking}
        style={{ marginTop: "20px" }}
      >
        {checking ? "Checking email..." : "Continue →"}
      </button>
    </div>
  );
}

function Step2StudentPersonal({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  function field(key, value) { onChange({ ...data, [key]: value }); }

  /**
   * Ensures required personal information
   * has been completed before continuing.
   */
  function validate() {
    const errs = {};
    if (!data.firstName?.trim()) errs.firstName = "First name is required.";
    if (!data.lastName?.trim())  errs.lastName  = "Last name is required.";
    if (!data.country || data.country === "Select country")
      errs.country = "Please select your country.";
    return errs;
  }

  function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onNext();
  }

  return (
    <div className="auth-form-panel">
      <ProgressBar step={2} role="student" />

      <h2 className="auth-form__heading">Personal information</h2>
      <p className="auth-form__sub">Tell us a little about yourself.</p>

      <div className="auth-name-row">
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="s2s-fname">First name</label>
          <input
            id="s2s-fname"
            type="text"
            className={`auth-field__input ${errors.firstName ? "auth-field__input--error" : ""}`}
            placeholder="Aisha"
            value={data.firstName || ""}
            onChange={(e) => { field("firstName", e.target.value); setErrors(p => ({...p, firstName: ""})); }}
            autoComplete="given-name"
            autoFocus
          />
          {errors.firstName && <p className="auth-field__error" role="alert">{errors.firstName}</p>}
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="s2s-lname">Last name</label>
          <input
            id="s2s-lname"
            type="text"
            className={`auth-field__input ${errors.lastName ? "auth-field__input--error" : ""}`}
            placeholder="Kamara"
            value={data.lastName || ""}
            onChange={(e) => { field("lastName", e.target.value); setErrors(p => ({...p, lastName: ""})); }}
            autoComplete="family-name"
          />
          {errors.lastName && <p className="auth-field__error" role="alert">{errors.lastName}</p>}
        </div>
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s2s-country">Country / nationality</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">🌍</span>
          <select
            id="s2s-country"
            className={`auth-field__input auth-field__input--icon auth-field__select ${errors.country ? "auth-field__input--error" : ""}`}
            value={data.country || "Select country"}
            onChange={(e) => { field("country", e.target.value); setErrors(p => ({...p, country: ""})); }}
          >
            {COUNTRIES.map(c => (
              <option key={c} value={c} disabled={c === "Select country"}>{c}</option>
            ))}
          </select>
        </div>
        {errors.country && <p className="auth-field__error" role="alert">{errors.country}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s2s-phone">
          Phone number <span className="auth-field__optional">(optional)</span>
        </label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">📱</span>
          <input
            id="s2s-phone"
            type="tel"
            className="auth-field__input auth-field__input--icon"
            placeholder="+1 000 000 0000"
            value={data.phone || ""}
            onChange={(e) => field("phone", e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="auth-btn-row">
        <button type="button" className="auth-btn auth-btn--ghost" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="auth-btn auth-btn--primary auth-btn--grow" onClick={handleNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function Step3StudentAcademic({ data, onChange, onSubmit, onBack, loading }) {
  const [errors, setErrors] = useState({});

  function field(key, value) { onChange({ ...data, [key]: value }); }

  /**
   * Validates academic information before
   * submitting the registration request.
   */
  function validate() {
    const errs = {};
    if (!data.level || data.level === "Select level")
      errs.level = "Please select your education level.";
    if (!data.field || data.field === "Select field")
      errs.field = "Please select your field of study.";
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit();
  }

  return (
    <div className="auth-form-panel">
      <ProgressBar step={3} role="student" />

      <h2 className="auth-form__heading">Academic information</h2>
      <p className="auth-form__sub">Powers your scholarship matches — update anytime.</p>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3s-level">Education level</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">🎓</span>
          <select
            id="s3s-level"
            className={`auth-field__input auth-field__input--icon auth-field__select ${errors.level ? "auth-field__input--error" : ""}`}
            value={data.level || "Select level"}
            onChange={(e) => { field("level", e.target.value); setErrors(p => ({...p, level: ""})); }}
          >
            {LEVELS.map(l => (
              <option key={l} value={l} disabled={l === "Select level"}>{l}</option>
            ))}
          </select>
        </div>
        {errors.level && <p className="auth-field__error" role="alert">{errors.level}</p>}
      </div>
      
      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3s-field">Field of study</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">📚</span>
          <select
            id="s3s-field"
            className={`auth-field__input auth-field__input--icon auth-field__select ${errors.field ? "auth-field__input--error" : ""}`}
            value={data.field || "Select field"}
            onChange={(e) => { field("field", e.target.value); setErrors(p => ({...p, field: ""})); }}
          >
            {FIELDS.map(f => (
              <option key={f} value={f} disabled={f === "Select field"}>{f}</option>
            ))}
          </select>
        </div>
        {errors.field && <p className="auth-field__error" role="alert">{errors.field}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3s-inst">
          Institution <span className="auth-field__optional">(optional)</span>
        </label>
        <input
          id="s3s-inst"
          type="text"
          className="auth-field__input"
          placeholder="e.g. London School of Economics"
          value={data.institution || ""}
          onChange={(e) => field("institution", e.target.value)}
        />
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3s-gpa">
          GPA / grade average <span className="auth-field__optional">(optional)</span>
        </label>
        <input
          id="s3s-gpa"
          type="text"
          className="auth-field__input"
          placeholder="e.g. 3.8 / 4.0 or First Class"
          value={data.gpa || ""}
          onChange={(e) => field("gpa", e.target.value)}
        />
      </div>

      <div className="auth-btn-row">
        <button type="button" className="auth-btn auth-btn--ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="auth-btn auth-btn--primary auth-btn--grow"
          onClick={handleSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className="auth-btn__loading">
              <span className="auth-spinner" aria-hidden="true" />
              Creating account…
            </span>
          ) : (
            "Create my account →"
          )}
        </button>
      </div>
    </div>
  );
}

function Step2ProviderOrg({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  function field(key, value) { onChange({ ...data, [key]: value }); }

  /**
   * Validates organisation details before
   * proceeding to provider verification.
   */
  function validate() {
    const errs = {};
    if (!data.orgName?.trim())  errs.orgName  = "Organisation name is required.";
    if (!data.orgType || data.orgType === "Select type")
      errs.orgType = "Please select your organisation type.";
    if (!data.website?.trim())  errs.website  = "Website URL is required.";
    return errs;
  }

  function handleNext() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onNext();
  }

  return (
    <div className="auth-form-panel">
      <ProgressBar step={2} role="provider" />

      <h2 className="auth-form__heading">Organisation information</h2>
      <p className="auth-form__sub">Tell us about the organisation offering scholarships.</p>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s2p-orgname">Organisation name</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">🏢</span>
          <input
            id="s2p-orgname"
            type="text"
            className={`auth-field__input auth-field__input--icon ${errors.orgName ? "auth-field__input--error" : ""}`}
            placeholder="e.g. Gates Foundation"
            value={data.orgName || ""}
            onChange={(e) => { field("orgName", e.target.value); setErrors(p => ({...p, orgName: ""})); }}
            autoComplete="organization"
            autoFocus
          />
        </div>
        {errors.orgName && <p className="auth-field__error" role="alert">{errors.orgName}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s2p-orgtype">Organisation type</label>
        <select
          id="s2p-orgtype"
          className={`auth-field__input auth-field__select ${errors.orgType ? "auth-field__input--error" : ""}`}
          value={data.orgType || "Select type"}
          onChange={(e) => { field("orgType", e.target.value); setErrors(p => ({...p, orgType: ""})); }}
        >
          {ORG_TYPES.map(t => (
            <option key={t} value={t} disabled={t === "Select type"}>{t}</option>
          ))}
        </select>
        {errors.orgType && <p className="auth-field__error" role="alert">{errors.orgType}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s2p-website">Organisation website</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">🌐</span>
          <input
            id="s2p-website"
            type="url"
            className={`auth-field__input auth-field__input--icon ${errors.website ? "auth-field__input--error" : ""}`}
            placeholder="https://your-organisation.org"
            value={data.website || ""}
            onChange={(e) => { field("website", e.target.value); setErrors(p => ({...p, website: ""})); }}
          />
        </div>
        {errors.website && <p className="auth-field__error" role="alert">{errors.website}</p>}
      </div>

      <div className="auth-btn-row">
        <button type="button" className="auth-btn auth-btn--ghost" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="auth-btn auth-btn--primary auth-btn--grow" onClick={handleNext}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function Step3ProviderVerify({ data, onChange, onSubmit, onBack, loading }) {
  const [errors, setErrors] = useState({});

  function field(key, value) { onChange({ ...data, [key]: value }); }

  /**
   * Validates provider verification details
   * before creating the provider account.
   */
  function validate() {
    const errs = {};
    if (!data.contactName?.trim())  errs.contactName  = "Contact name is required.";
    if (!data.contactTitle?.trim()) errs.contactTitle = "Job title is required.";
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit();
  }

  return (
    <div className="auth-form-panel">
      <ProgressBar step={3} role="provider" />

      <h2 className="auth-form__heading">Verification details</h2>
      <p className="auth-form__sub">We verify all providers — usually within 48 hours.</p>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3p-cname">Your full name</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">👤</span>
          <input
            id="s3p-cname"
            type="text"
            className={`auth-field__input auth-field__input--icon ${errors.contactName ? "auth-field__input--error" : ""}`}
            placeholder="Dr. James Osei"
            value={data.contactName || ""}
            onChange={(e) => { field("contactName", e.target.value); setErrors(p => ({...p, contactName: ""})); }}
            autoComplete="name"
            autoFocus
          />
        </div>
        {errors.contactName && <p className="auth-field__error" role="alert">{errors.contactName}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3p-ctitle">Your job title</label>
        <div className="auth-field__wrap">
          <span className="auth-field__icon" aria-hidden="true">💼</span>
          <input
            id="s3p-ctitle"
            type="text"
            className={`auth-field__input auth-field__input--icon ${errors.contactTitle ? "auth-field__input--error" : ""}`}
            placeholder="e.g. Head of Programmes"
            value={data.contactTitle || ""}
            onChange={(e) => { field("contactTitle", e.target.value); setErrors(p => ({...p, contactTitle: ""})); }}
          />
        </div>
        {errors.contactTitle && <p className="auth-field__error" role="alert">{errors.contactTitle}</p>}
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3p-regno">
          Registration / charity number <span className="auth-field__optional">(optional)</span>
        </label>
        <input
          id="s3p-regno"
          type="text"
          className="auth-field__input"
          placeholder="e.g. 1234567 or SC000123"
          value={data.regNumber || ""}
          onChange={(e) => field("regNumber", e.target.value)}
        />
      </div>

      <div className="auth-field">
        <label className="auth-field__label" htmlFor="s3p-desc">
          About your scholarships <span className="auth-field__optional">(optional)</span>
        </label>
        <textarea
          id="s3p-desc"
          className="auth-field__input auth-field__textarea"
          placeholder="Briefly describe the types of scholarships your organisation offers…"
          value={data.description || ""}
          onChange={(e) => field("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="auth-btn-row">
        <button type="button" className="auth-btn auth-btn--ghost" onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className="auth-btn auth-btn--primary auth-btn--grow"
          onClick={handleSubmit}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className="auth-btn__loading">
              <span className="auth-spinner" aria-hidden="true" />
              Submitting…
            </span>
          ) : (
            "Submit for verification →"
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Final success screen displayed after
 * successful account creation.
 * Content varies based on user role.
 */
function StepSuccess({ role, data }) {
  const firstName = data.firstName || data.contactName?.split(" ")[0] || "there";

  return (
    <div className="auth-form-panel auth-form-panel--centered">
      <div className="auth-success-circle" aria-hidden="true">🎉</div>

      <h2 className="auth-form__heading">You're in, {firstName}!</h2>
      <p className="auth-form__sub">
        {role === "student"
          ? "Your account is ready. We've started matching you with scholarships."
          : "Your application is under review. We'll verify your organisation within 48 hours."}
      </p>

      <div className="auth-success-actions">
        {role === "student" ? (
          <>
            <a href="/dashboard" className="auth-btn auth-btn--primary auth-btn--full">
              See my scholarship matches →
            </a>
            <a href="/profile" className="auth-btn auth-btn--outline auth-btn--full">
              Complete my profile
            </a>
          </>
        ) : (
          <a href="/provider/dashboard" className="auth-btn auth-btn--primary auth-btn--full">
            Go to my dashboard →
          </a>
        )}
      </div>

      <div className="auth-success-callout">
        <span aria-hidden="true">📬</span>
        <p>Your account has been successfully created and is ready to use.</p>
      </div>
    </div>
  );
}

export default function SignUp() {
  const navigate = useNavigate();

  const [step,     setStep]    = useState(1);
  const [role,     setRole]    = useState("student");  // default to student
  const [formData, setForm]    = useState({});
  const [loading,  setLoading] = useState(false);

  /** Accumulate field changes into formData */
  function handleFormChange(updated) {
    setForm(updated);
  }

  /**
   * Switches account type and clears
   * role-specific form fields while
   * preserving login information.
   */
  function handleRoleChange(newRole) {
    setRole(newRole);
    setForm(prev => ({
      email:    prev.email    || "",
      password: prev.password || "",
      terms:    prev.terms    || false,
    }));
  }

  /**
   * Sends registration data to the backend API.
   * If successful, displays the success screen.
   * Otherwise shows an error message.
   */
  async function handleFinalSubmit() {
    try {
        setLoading(true)

        const payload = {
            role,
            ...formData
        }

        const response = await registerUser(payload)

        const { token, user } = response.data
        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))

        toast.success("Account created successfully!")

        if(role === "student"){
            navigate("/dashboard")
        }
        else{
            navigate("/provider/dashboard")
        }
    }
    catch(error) {
        toast.error(
            error.response?.data?.message ||
            "Registration failed"
        )
    }
    finally {
        setLoading(false)
    }
  }

  return (
    <div className="auth-root">
      <ThemeToggle style={{ position: "fixed", top: 20, right: 20, zIndex: 50 }} />
      <LeftPanel role={role} step={step} />

      <main className="auth-right" aria-label="Create your Scholarix account">

        {step === 1 && (
          <Step1Account
            role={role}
            onRoleChange={handleRoleChange}
            data={formData}
            onChange={handleFormChange}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && role === "student" && (
          <Step2StudentPersonal
            data={formData}
            onChange={handleFormChange}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 2 && role === "provider" && (
          <Step2ProviderOrg
            data={formData}
            onChange={handleFormChange}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && role === "student" && (
          <Step3StudentAcademic
            data={formData}
            onChange={handleFormChange}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}
        {step === 3 && role === "provider" && (
          <Step3ProviderVerify
            data={formData}
            onChange={handleFormChange}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}

        {step === 4 && (
          <StepSuccess role={role} data={formData} />
        )}

      </main>
    </div>
  );
}