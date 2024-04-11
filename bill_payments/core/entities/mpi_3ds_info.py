from dataclasses import dataclass


@dataclass
class MPI3DSInfo:
    browser_accept_header: str
    browser_color_depth: int
    browser_ip: str
    browser_language: str
    browser_screen_height: int
    browser_screen_width: int
    browser_tz: str
    browser_user_agent: str
    browser_javascript_enabled: bool
    window_height: int
    window_width: int
