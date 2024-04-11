from typing import Callable

import pytest
from selenium.common.exceptions import TimeoutException
from selenium.webdriver import Firefox
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait

from sendr_qlog import LoggerContext

from pay.integration.catalog import User
from pay.integration.conf import settings


class RBSThreeDSStepper:
    def __init__(self, user: User, logger: LoggerContext):
        self.user = user
        self.logger = logger

    def challenge(self, action_url: str) -> None:
        return self._challenge(action_url=action_url, pin_strategy=self._challenge_default_pin_strategy)

    def rbs_v2_challenge(self, action_url: str) -> None:
        return self._challenge(action_url=action_url, pin_strategy=self._challenge_rbs_v2_strategy)

    def v2_method(self, action_url: str) -> None:
        with pytest.allure.step('Handle 3DS2 Method'):
            with pytest.allure.step('WEBDRIVER_INIT'):
                browser = self._get_browser(action_url)

            with pytest.allure.step('WEBDRIVER_GET_ACTION'):
                browser.get(action_url)
                self._log_browser_state(browser, 'STEPPER_3DS_WEBDRIVER_GET')
                browser.execute_script(
                    """
                    window.addEventListener("message", function (e) {
                        window.paytestSeleniumMessage = e.data
                    })
                    """
                )

            with pytest.allure.step('WEBDRIVER_PROCESS_RESULT'):
                browser.switch_to.default_content()
                try:
                    tds_result = WebDriverWait(browser, timeout=20).until(
                        lambda d: d.execute_script('return window.paytestSeleniumMessage')
                    )
                    with self.logger:
                        self.logger.context_push(tds_result=tds_result)
                        self.logger.info('PARSED_RESULT')
                    assert tds_result['status'] == 'AUTHORIZED'
                except TimeoutException:
                    # NOTE: более тестируемый waiter мог бы в контекст записать флажочек
                    # Но если таймаут произошел (спустя 10 сек), то инициируемый waiter'ом запрос
                    # в бэкенд должен поменять статус транзакции и тест всё равно должен сойтись
                    self.logger.info('3DS_METHOD_TIMED_OUT')

    def _challenge(self, action_url: str, pin_strategy: Callable[[WebDriver], None]) -> None:
        with pytest.allure.step('Submit 3DS Challenge'):
            with pytest.allure.step('WEBDRIVER_INIT'):
                browser = self._get_browser(action_url)

            with pytest.allure.step('WEBDRIVER_GET_ACTION'):
                browser.get(action_url)
                self._log_browser_state(browser, 'STEPPER_3DS_WEBDRIVER_GET_ACTION')
                browser.execute_script(
                    """
                    window.addEventListener("message", function (e) {
                        window.paytestSeleniumMessage = e.data
                    })
                    return true
                    """
                )
                tds_iframe = browser.find_element(By.TAG_NAME, 'iframe')

            with pytest.allure.step('WEBDRIVER_ENTER_PIN'):
                browser.switch_to.frame(tds_iframe)
                pin_strategy(browser)

            with pytest.allure.step('WEBDRIVER_PROCESS_RESULT'):
                browser.switch_to.default_content()
                tds_result = WebDriverWait(browser, timeout=10).until(
                    lambda d: d.execute_script('return window.paytestSeleniumMessage')
                )
                with self.logger:
                    self.logger.context_push(tds_result=tds_result)
                    self.logger.info('PARSED_RESULT')
                assert tds_result['status'] == 'AUTHORIZED'

    def _get_browser(self, action_url: str) -> WebDriver:
        options = Options()
        options.headless = settings.SELENIUM_HEADLESS
        browser = Firefox(executable_path=settings.SELENIUM_WEBDRIVER_PATH, options=options)
        browser.get(action_url)
        for name, value in self.user.auth_cookies.items():
            browser.add_cookie({'name': name, 'value': value})
        return browser

    def _wait_url(
        self, browser: WebDriver, comp_func: Callable[[str], bool], wait_time: float = 0.100, attempts: int = 3
    ) -> None:
        def check_url(driver):
            current_url = driver.current_url
            comp_result = comp_func(current_url)
            with self.logger:
                self.logger.context_push(current_url=current_url, comp_result=comp_result)
                self.logger.info('WEBDRIVER_URL_CHECK')
            return

        try:
            WebDriverWait(browser, timeout=5).until(check_url)
        except TimeoutException:
            self._log_browser_state(browser, 'WAIT_URL_FAILURE')
            raise
        self._log_browser_state(browser, 'WAIT_URL_SUCCESS')

    def _log_browser_state(self, browser: WebDriver, message_id: str) -> None:
        with self.logger:
            self.logger.context_push(webdriver_page_source=browser.page_source)
            self.logger.context_push(webdriver_current_url=browser.current_url)
            self.logger.info(f'{message_id}:PAGE_CONTENT')

    def _challenge_default_pin_strategy(self, browser: WebDriver) -> None:
        password_input = WebDriverWait(browser, timeout=5).until(lambda d: d.find_element(By.NAME, 'password'))
        self._log_browser_state(browser, 'STEPPER_3DS_WEBDRIVER_CHALLENGE_PIN')
        password_input.send_keys('12345678')

    def _challenge_rbs_v2_strategy(self, browser: WebDriver) -> None:
        """
        У RBS прикольный тестовый acs v2. Там можно выбрать результат челленджа самому.
        """
        success_button = WebDriverWait(browser, timeout=5).until(
            lambda d: d.find_element(By.CSS_SELECTOR, '.btn-success')
        )
        self._log_browser_state(browser, 'STEPPER_3DS_WEBDRIVER_CHALLENGE_PIN')
        success_button.click()
