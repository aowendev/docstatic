import title from "title";

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove non-word [a-z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s_-]+/g, "_") // swap any length of whitespace, underscore, hyphen characters with a single _
    .replace(/^-+|-+$/g, ""); // remove leading, trailing -
};

export const docusaurusDate = (val) => {
  const ye = new Intl.DateTimeFormat("en", {
    year: "numeric",
  }).format(val);
  const mo = new Intl.DateTimeFormat("en", {
    month: "2-digit",
  }).format(val);
  const da = new Intl.DateTimeFormat("en", {
    day: "2-digit",
  }).format(val);
  return `${ye}-${mo}-${da}`;
};

export const titleFromSlug = (slug) => {
  const titleString = slug
    .split("/")
    .slice(1)
    .join(" – ")
    .replace(/-/g, " ")
    .replace(/\.[^/.]+$/, "");
  return title(titleString);
};

export const getDocId = (doc) => {
  return doc
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(1)
    .join("/");
};

export const getDocPath = (doc) => {
  return doc.replace(/\.mdx?$/, "");
};

export const getPageRoute = (page) => {
  return page
    .replace(/\.mdx?$/, "")
    .split("/")
    .slice(2)
    .join("/");
};

export const getPath = (page) => {
  return page.replace(/\.mdx?$/, "");
};

// Helper function to get all active conditions from hierarchical structure
export const getAllConditions = (conditionsData) => {
  const conditions = [];

  if (Array.isArray(conditionsData?.categories)) {
    for (const category of conditionsData.categories) {
      if (category.conditions && Array.isArray(category.conditions)) {
        for (const condition of category.conditions) {
          if (condition.active !== false) {
            // include active conditions and those without active field
            conditions.push(condition.condition);
          }
        }
      }
    }
  }

  return conditions;
};

// Helper function to get condition details by name
export const getConditionDetails = (conditionsData, conditionName) => {
  if (Array.isArray(conditionsData?.categories)) {
    for (const category of conditionsData.categories) {
      if (category.conditions && Array.isArray(category.conditions)) {
        for (const condition of category.conditions) {
          if (condition.condition === conditionName) {
            return {
              ...condition,
              category: category.name,
              categoryDescription: category.description,
            };
          }
        }
      }
    }
  }

  return null;
};
