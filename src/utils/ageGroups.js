const AGE_GROUP_RANGES = {
  'Infants (0 - 1 yr)': { from: 0, to: 1 },
  'Toddlers (1 - 2.5 yrs)': { from: 1, to: 2.5 },
  'Toddlers (2.5 - 3 yrs)': { from: 2.5, to: 3 },
  'Pre-School (3 - 4 yrs)': { from: 3, to: 4 },
  'Kindergarten (4 - 5 yrs)': { from: 4, to: 5 }
};

function parseAgeGroup(ageGroup) {
  if (!ageGroup) return { from: null, to: null };
  if (AGE_GROUP_RANGES[ageGroup]) return AGE_GROUP_RANGES[ageGroup];

  const match = String(ageGroup).match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (match) return { from: parseFloat(match[1]), to: parseFloat(match[2]) };
  return { from: null, to: null };
}

function ageInYears(dateOfBirth, now = new Date()) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  return (now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

function ageMatches(dateOfBirth, from, to) {
  const age = ageInYears(dateOfBirth);
  if (age == null || from == null || to == null) return false;
  if (age < from) return false;
  // Inclusive upper bound so a child who just turned 5 still matches Kindergarten (4-5)
  return age <= to;
}

function resolveAgeRange({ ageGroup, ageFrom, ageTo } = {}) {
  if (ageFrom != null && ageFrom !== '' && ageTo != null && ageTo !== '') {
    return { from: Number(ageFrom), to: Number(ageTo) };
  }
  return parseAgeGroup(ageGroup);
}

module.exports = {
  AGE_GROUP_RANGES,
  parseAgeGroup,
  ageInYears,
  ageMatches,
  resolveAgeRange
};
