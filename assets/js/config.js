/* Maison Aurelle — store configuration.
   OWNER: edit the values marked OWNER before launch. See STOREFRONT.md. */
window.MA = window.MA || {};
MA.config = {
  name: "Maison Aurelle",
  tagline: "Gold-Tone Statement Jewelry",
  // OWNER: this season's collection. The store name above stays the same; next season is a one-line change here
  // (stories and looks: assets/js/collections.js).
  season: { name: "The Gilded Hour", label: "Collection 2026" },
  description: "Sculptural gold-tone statement jewelry — molten cuffs, dome bangles, hammered earrings, coin necklaces, flower sets and stone-set rings in 18K gold PVD over stainless steel.",
  siteUrl: "",                 // OWNER: e.g. "https://www.example.com" (no trailing slash). Empty = relative URLs only.
  email: "",  // OWNER: replace
  phone: "",                   // OWNER: e.g. "+1 (555) 010-0100"; "" hides
  address: { line1: "", line2: "", city: "", region: "", postal: "", country: "" }, // line1 "" hides
  hours: "",                   // OWNER: e.g. "Tue–Sat, 10am–6pm"; "" hides
  social: { instagram: "", pinterest: "", facebook: "" },
  locale: "en-US", currency: "USD", orderPrefix: "MA",
  // OWNER: legal details for privacy.html. Empty values show as [BRACKETED] placeholders on the page.
  legal: { businessName: "", address: "", privacyEmail: "", markets: "", paymentProcessor: "", fulfilmentPartners: "",
           retentionOrders: "", retentionMessages: "", retentionAnalytics: "", effectiveDate: "" },
  privacyDraft: true,
  // OWNER: analytics stays completely off (no network calls) until ga4Id is set, e.g. "G-XXXXXXXXXX". See STOREFRONT.md.
  analytics: { ga4Id: "", consentRequired: true, excludeInternal: true },           // true = "DRAFT" banner + noindex on privacy.html. Set false only after legal review.
  returnsDays: 30,              // OWNER: return window in days (hero trust line, policy)
  shipping: { freeThreshold: 250, flatRate: 15, countries: [ {code:"US",name:"United States"}, {code:"CA",name:"Canada"} ] },
  tax: { rate: 0.07, label: "Estimated tax" }, // rate 0 => "Calculated on confirmation"
  checkout: {
    formEndpoint: "", allowStripeLinks: true,   // formEndpoint: e.g. a Formspree form URL
    // OWNER: Stripe Checkout via the order Worker (backend/API.md). When set AND storeOpen is true it replaces the
    // order-request form with a review page that sends only product ids and quantities, and the bag shows tax as
    // "Calculated at checkout" (Stripe's page is the source of truth). Example:
    // "https://maison-aurelle-checkout.<account>.workers.dev" (no trailing slash).
    apiBase: ""
  },
  contact: { formEndpoint: "" }, newsletter: { formEndpoint: "" },
  // OWNER: one switch for launch. false = "opening soon" mode: no checkout form, no contact form, no email links.
  // OWNER: search engines. Flip with tools/set_indexable.py (it also edits every page head and robots.txt).
  indexable: false,
  storeOpen: false,
  closedNotice: "Opening soon — explore the collection; ordering opens shortly.",
  notice: "Preview store — orders are placed as requests; we confirm availability and arrange payment before anything ships.",
  maxQtyPerItem: 10, openDrawerOnAdd: true,
  // OWNER: retail price = wholesale cost × multiplier, rounded to the nearest roundTo dollars (the lookbook rule: $5).
  // Lineup pieces carry the lookbook's explicit retail `price` and ignore this (see STOREFRONT.md "Pricing").
  pricing: { multiplier: 75, roundTo: 5 },
  // OWNER: collection slugs (e.g. "frangipani-garden") whose collection page and product pages print black-on-pink
  // instead of cobalt-on-paper. 'all' = the Shop-all page. Static pages set their colour with data-theme on <html>.
  pinkCollections: [],
  // OWNER: true = every other product card (and the product page it opens) prints black-on-pink.
  alternatePinkProducts: true
};
