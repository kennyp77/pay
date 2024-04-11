from dataclasses import asdict, dataclass
from typing import List


@dataclass
class ThreeDSBrowserDataHeaders:
    accept_header: str  # emv:browserAcceptHeader
    ip: str  # emv:browserIP
    user_agent: str  # emv:browserUserAgent

    def __post_init__(self) -> None:
        # Note: If the total length of
        # the User-Agent sent by
        # the browser exceeds 2048
        # characters, the 3DS
        # Server truncates the
        # excess portion.
        self.accept_header = self.accept_header[0:2048]
        self.user_agent = self.user_agent[0:2048]


@dataclass
class ThreeDSBrowserDataPayload:
    java_enabled: bool  # emv:browserJavaEnabled
    language: str  # emv:browserLanguage единственный BCP47 язык (про количество тегов в стандарте ничего нет)
    screen_color_depth: int  # emv:browserColorDepth
    screen_height: int  # emv:browserScreenHeight
    screen_width: int  # emv:browserScreenWidth
    window_height: int  # нестандартное
    window_width: int  # нестандартное
    timezone: int  # emv:browserTZ = (utc_time - cardholder_browser_time) in minutes. note: for msk it is -180

    def map_screen_color_depth_to_supported(self, supported: List[int]) -> int:
        """
        Говорят, к ближайшему надо округлять.

        If an ACS does not
        support the provided
        value, then the ACS can
        use the closest supported
        value. For example, if the
        value provided = 30 and
        the ACS does not support
        that value, then the ACS
        could use the value = 24
        """
        supported_weighted = [(color, abs(color - self.screen_color_depth)) for color in supported]
        found_color, _ = min(supported_weighted, key=lambda item: item[1])
        return found_color


@dataclass
class ThreeDSBrowserData(ThreeDSBrowserDataHeaders, ThreeDSBrowserDataPayload):
    """
    Список стандартизирован глава A.6 спеки. Описание смотреть в A.4.

    Надо попробовать использовать эту сущность во всех клиентах psp.
    """

    @classmethod
    def from_parts(cls, payload: ThreeDSBrowserDataPayload, headers: ThreeDSBrowserDataHeaders) -> 'ThreeDSBrowserData':
        data = asdict(payload)
        data.update(asdict(headers))
        return cls(**data)


@dataclass
class ThreeDS2AuthenticationRequest:
    """
    Это так называемый AReq для 3ds v2. Точнее, кусочек AReq'а.
    Spec: https://www.emvco.com/emv-technologies/3d-secure/
    Spec copy: https://jing.yandex-team.ru/files/hmnid/EMVCo_3DS_CoreSpec_v2.3_20213009%20%284%29.pdf
    С полным списком можно ознакомиться в B.1. Большой...

    AReq отправляется процессингом в эмитента. В ответ получается ARes.
    Соответственно, формированием AReq занимается psp.
    А мы просто докладываем то, чего у psp нету (из-за back-to-back flow).
    """

    challenge_notification_url: str  # emv:notificationURL
    browser_data: ThreeDSBrowserData
