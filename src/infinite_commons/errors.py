"""Domain errors for deterministic bootstrap loading."""


class CommonsError(Exception):
    """Base domain error."""


class BootstrapContractNotFoundError(CommonsError):
    """Raised when latest bootstrap contract file is missing."""


class BootstrapContractMalformedError(CommonsError):
    """Raised when bootstrap contract JSON is malformed or invalid."""


class ArtifactNotFoundError(CommonsError):
    """Raised when an expected artifact is missing from disk."""


class ArtifactMalformedError(CommonsError):
    """Raised when artifact JSON cannot be parsed."""


class UnreadablePathError(CommonsError):
    """Raised when a file cannot be read due to permission/path issues."""
