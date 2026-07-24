/**
 * Client-side mirror of the backend's eligibility rule
 * (Backend/model/scholarshipModel.js -> isEligibleForScholarship).
 * Used only to drive UI state (badges, disabled buttons) — the backend
 * is the actual enforcement boundary and re-checks on every application.
 */
export function checkEligibility(scholarship, student) {
  const reasons = [];

  if (!student) {
    return { eligible: true, reasons: [] };
  }

  if (scholarship.level !== "All Levels" && scholarship.level !== student.level) {
    reasons.push(`requires level "${scholarship.level}" — your profile is set to "${student.level || "not set"}"`);
  }

  if (scholarship.field !== "All Fields" && scholarship.field !== student.field) {
    reasons.push(`requires field "${scholarship.field}" — your profile is set to "${student.field || "not set"}"`);
  }

  if (
    scholarship.country !== "Global" &&
    scholarship.country !== "Other" &&
    scholarship.country !== student.country
  ) {
    reasons.push(`is limited to "${scholarship.country}" — your profile is set to "${student.country || "not set"}"`);
  }

  return { eligible: reasons.length === 0, reasons };
}
