// POST /listings/:id/claim takes no request body — listingId comes from the
// URL, takerId from the authenticated session. Kept as an explicit empty DTO
// to match the module's dto/ convention and leave room for future fields.
export class ClaimListingDto {}
