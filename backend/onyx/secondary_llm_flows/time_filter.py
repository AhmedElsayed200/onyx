from datetime import datetime

from dateutil.parser import parse

from onyx.llm.interfaces import LLM
from onyx.utils.datetime import datetime_to_utc
from onyx.utils.logger import setup_logger

logger = setup_logger()


def best_match_time(time_str: str) -> datetime | None:
    preferred_formats = ["%m/%d/%Y", "%m-%d-%Y"]

    for fmt in preferred_formats:
        try:
            # As we don't know if the user is interacting with the API server from
            # the same timezone as the API server, just assume the queries are UTC time
            # the few hours offset (if any) shouldn't make any significant difference
            dt = datetime.strptime(time_str, fmt)
            return datetime_to_utc(dt)
        except ValueError:
            continue

    # If the above formats don't match, try using dateutil's parser
    try:
        return datetime_to_utc(parse(time_str))
    except ValueError:
        return None


def extract_time_filter(query: str, llm: LLM) -> tuple[datetime | None, bool]:
    """Returns a datetime if a hard time filter should be applied for the given query
    Additionally returns a bool, True if more recently updated Documents should be
    heavily favored"""
    raise NotImplementedError("This function should not be getting called right now")
