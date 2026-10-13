"""Explicit, offline-only PhiSpace public artifact export.

Never scans Infinite Porch files, connects to a Porch daemon, uploads anything,
or treats a plain JSON field as an authenticated identity or consent proof.
Only manually chosen text in an explicit draft can leave via a chosen output.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

DRAFT_SCHEMA = "commons.phispace.draft.v0.1"
PUBLIC_SCHEMA = "commons.phispace.public.v0.1"
PUBLICATION_MODE = "owner-curated-export"
MAX_BYTES = 16_384
SECTION_KINDS = frozenset({"about", "music", "gallery", "projects", "guestbook"})
SPACE_ID = re.compile(r"phispace\.[a-z0-9][a-z0-9-]{0,63}\Z")
SECTION_ID = re.compile(r"[a-z][a-z0-9-]{0,31}\Z")
DIGEST = re.compile(r"[0-9a-f]{64}\Z")


class PublicationRejected(ValueError):
    """Unreviewed, malformed, changed, or unsafe public content."""


def _keys(value: Any, allowed: set[str], label: str) -> None:
    if not isinstance(value, dict) or set(value) != allowed:
        raise PublicationRejected(f"{label}: unexpected or missing fields")


def _text(value: Any, length: int, label: str) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > length:
        raise PublicationRejected(f"{label}: missing or oversized text")
    for char in value:
        point = ord(char)
        if point < 32 or point == 127 or 0x202A <= point <= 0x202E or 0x2066 <= point <= 0x2069:
            raise PublicationRejected(f"{label}: control/bidi characters prohibited")
    return value


def _object_pairs_no_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise PublicationRejected(f"duplicate JSON field {key!r}")
        result[key] = value
    return result


def _reject_constant(value: str) -> None:
    raise PublicationRejected(f"nonstandard JSON constant: {value}")


def validate_draft(raw: Any) -> dict[str, Any]:
    """Reject unknown fields and produce only allowlisted visitor-visible text."""
    _keys(raw, {"schema", "space_id", "profile", "sections"}, "draft")
    if raw["schema"] != DRAFT_SCHEMA:
        raise PublicationRejected("unsupported draft schema")
    space = raw["space_id"]
    if not isinstance(space, str) or not SPACE_ID.fullmatch(space):
        raise PublicationRejected("unsafe space ID")
    _keys(raw["profile"], {"display_name", "tagline", "welcome"}, "profile")
    profile = {
        "display_name": _text(raw["profile"]["display_name"], 72, "display name"),
        "tagline": _text(raw["profile"]["tagline"], 140, "tagline"),
        "welcome": _text(raw["profile"]["welcome"], 500, "welcome"),
    }
    incoming = raw["sections"]
    if not isinstance(incoming, list) or not 1 <= len(incoming) <= 6:
        raise PublicationRejected("expected 1 to 6 sections")
    sections: list[dict[str, str]] = []
    found: set[str] = set()
    for row in incoming:
        _keys(row, {"id", "kind", "title", "body"}, "section")
        section_id = row["id"]
        if not isinstance(section_id, str) or not SECTION_ID.fullmatch(section_id):
            raise PublicationRejected("unsafe section ID")
        if section_id in found:
            raise PublicationRejected("duplicate section ID")
        found.add(section_id)
        if not isinstance(row["kind"], str) or row["kind"] not in SECTION_KINDS:
            raise PublicationRejected("unsupported section kind")
        sections.append({
            "id": section_id,
            "kind": row["kind"],
            "title": _text(row["title"], 72, "section title"),
            "body": _text(row["body"], 500, "section body"),
        })
    # A visibility claim does NOT originate in source data. It is added only
    # to the exported artifact after the operator approves the digest.
    return {
        "schema": PUBLIC_SCHEMA,
        "space_id": space,
        "visibility": "public",
        "publication_mode": PUBLICATION_MODE,
        "profile": profile,
        "sections": sections,
    }


def read_draft(path: Path) -> dict[str, Any]:
    """Read exactly one operator-selected JSON file, not a directory or symlink."""
    if path.is_symlink() or not path.is_file():
        raise PublicationRejected("draft must be a regular non-symlink file")
    if path.stat().st_size > MAX_BYTES:
        raise PublicationRejected("draft exceeds 16 KiB")
    source = path.read_bytes()
    if len(source) > MAX_BYTES:
        raise PublicationRejected("draft exceeds 16 KiB")
    try:
        decoded = source.decode("utf-8")
        raw = json.loads(
            decoded,
            object_pairs_hook=_object_pairs_no_duplicates,
            parse_constant=_reject_constant,
        )
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise PublicationRejected("draft is not valid UTF-8 JSON") from exc
    return validate_draft(raw)


def canonical_artifact(draft: dict[str, Any]) -> tuple[bytes, str]:
    """Return exact bytes to review and the corresponding content hash."""
    canonical = json.dumps(draft, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    payload = canonical.encode("utf-8")
    if len(payload) > MAX_BYTES:
        raise PublicationRejected("public artifact exceeds 16 KiB")
    return payload, hashlib.sha256(payload).hexdigest()


def export_approved(payload: bytes, digest: str, expected: str, output: Path) -> None:
    """Create-only write, never a background publish or overwrite."""
    if not DIGEST.fullmatch(expected) or digest != expected:
        raise PublicationRejected("approval hash missing or mismatched; review again")
    if output.exists() or output.is_symlink():
        raise PublicationRejected("output already exists; refusing overwrite")
    if not output.parent.is_dir():
        raise PublicationRejected("output directory must already exist")
    if output.suffix.lower() != ".json":
        raise PublicationRejected("output must end in .json")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(output, flags, 0o600)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
    except BaseException:
        try:
            output.unlink(missing_ok=True)
        except OSError:
            pass
        raise


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m infinite_commons.phispace_publisher",
        description="Review and explicitly export a text-only local PhiSpace public artifact.",
    )
    commands = parser.add_subparsers(dest="command", required=True)
    preview = commands.add_parser("preview", help="Show every public field and approval SHA-256")
    preview.add_argument("--draft", type=Path, required=True)
    publish = commands.add_parser("export", help="Create a local JSON artifact, never upload it")
    publish.add_argument("--draft", type=Path, required=True)
    publish.add_argument("--out", type=Path, required=True)
    publish.add_argument("--approve-sha256", required=True)
    publish.add_argument(
        "--confirm-public",
        action="store_true",
        help="Confirm the entire reviewed artifact is appropriate for public release",
    )
    args = parser.parse_args(argv)
    try:
        if args.command == "export" and not args.confirm_public:
            raise PublicationRejected("--confirm-public is required")
        payload, digest = canonical_artifact(read_draft(args.draft))
        if args.command == "preview":
            print("REVIEW ALL PUBLIC FIELDS BELOW. This does not publish anything.")
            print(payload.decode("utf-8"), end="")
            print(f"SHA256: {digest}")
            print("The SHA is a content-change check, NOT an identity or consent signature.")
        else:
            export_approved(payload, digest, args.approve_sha256, args.out)
            print(f"LOCAL ARTIFACT CREATED: {args.out}")
            print(f"SHA256: {digest}")
            print("NOT ONLINE. You must separately review and intentionally distribute it.")
        return 0
    except (PublicationRejected, OSError) as exc:
        print(f"PhiSpace export blocked: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
