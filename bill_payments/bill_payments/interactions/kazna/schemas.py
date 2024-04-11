import typing

from marshmallow import post_dump, pre_dump
from marshmallow.decorators import pre_load
from marshmallow.fields import Boolean, Date, DateTime, Dict, Integer, List, Nested, String
from marshmallow.validate import Length, Regexp
from marshmallow_enum import EnumField

from sendr_utils.schemas import BaseDataClassSchema as BaseSchema
from sendr_utils.schemas import OneOfSchema

from pay.bill_payments.bill_payments.interactions.kazna.entities import (
    TDS,
    AdditionalData,
    AddressJKH,
    Card,
    Charge,
    ChargeData,
    DepartmentType,
    DeviceChannel,
    DocumentCode,
    MpiExtInfo,
    PayerDoc,
    PayerParams,
    PaymentData,
    PaymentInfoResponse,
    PaymentParams,
    PaymentStatus,
    PaymentStatusCode,
    PayPeriod,
    PayRequest,
    PayResponse,
    PayType,
    SearchRequest,
    SearchResponse,
    SearchStatus,
    SubscriptionInfoResponse,
    UnsubscribeRequest,
)
from pay.bill_payments.bill_payments.utils.schema import NestedJsonStringField, ValueField

DataClassType = typing.TypeVar('DataClassType')


class BaseDataClassSchema(BaseSchema[DataClassType]):
    @post_dump
    def remove_none(self, data):
        return {key: value for key, value in data.items() if value is not None}

    @property
    def data_class(self) -> typing.Callable[..., DataClassType]:
        return self._get_dataclass_from_generic_args(generic_origin=BaseDataClassSchema)


class BaseDocument(BaseDataClassSchema[PayerDoc]):
    code = EnumField(DocumentCode, load_by=EnumField.VALUE)
    value = List(String)

    @pre_load
    def pre_load(self, data, **kwargs):
        data['code'] = data['code'].value
        return data


class PassportRussiaFederation(BaseDocument):
    value = List(String(validate=Regexp(r'\d{10}')))


class PassportForeign(BaseDocument):
    value = List(String(validate=Length(max=12)))


class DriverLicense(BaseDocument):
    value = List(String(validate=Regexp(r'[0-9А-Яа-я]{10}')))


class VehicleRegistrationCertificate(BaseDocument):
    value = List(String(validate=Regexp(r'[0-9А-Яа-я]{10}')))


class DocumentSchema(OneOfSchema):
    type_field = 'code'
    type_field_remove = False
    type_schemas = {
        DocumentCode.PASSPORT_RUSSIAN_FEDERATION: PassportRussiaFederation,
        DocumentCode.PASSPORT_FOREIGN: PassportForeign,
        DocumentCode.DRIVER_LICENSE: DriverLicense,
        DocumentCode.VEHICLE_REGISTRATION_CERTIFICATE: VehicleRegistrationCertificate,
    }

    def get_obj_type(self, obj: PayerDoc) -> DocumentCode:
        return obj.code

    def _dump(self, obj: PayerDoc, *, update_fields: bool = True, **kwargs: typing.Dict[str, typing.Any]) -> typing.Any:
        result = super()._dump(obj, update_fields=update_fields, **kwargs)
        result.data['code'] = obj.code.value
        return result

    def _load(self, data, *, partial=None, **kwargs):
        data['code'] = DocumentCode(data['code'])
        return super()._load(data, partial=partial, **kwargs)


class AddressJKHSchema(BaseDataClassSchema[AddressJKH]):
    region = String(load_from='Region')
    city = String(load_from='City')
    street = String(load_from='Street')
    house_num = String(load_from='HouseNum')
    fias_house_guid = String(load_from='FIASHouseGuid')
    apartment = String(load_from='Apartment')
    address_string = String(load_from='AddressString')


class PayPeriodSchema(BaseDataClassSchema[PayPeriod]):
    year = String()
    month = String()


class AdditionalDataSchema(BaseDataClassSchema[AdditionalData]):
    discount_size = String(load_from='discountSize')
    discount_date = Date(load_from='discountDate')
    spi_name_phone = String(load_from='spiNamePhone')
    legal_act = String(load_from='legalAct')
    offense_name = String(load_from='offenseName')
    offense_place = String(load_from='offensePlace')
    offense_date = DateTime(load_from='offenseDate')

    @pre_load
    def pre_load(self, data, **kwargs):
        if 'offenseDate' in data and ':' not in data['offenseDate']:
            data['offenseDate'] += ' 00:00:00'
        return data


class PaymentDataSchema(BaseDataClassSchema[PaymentData]):
    sum = Integer()
    date = DateTime()


class ChargeDataSchema(BaseDataClassSchema[ChargeData]):
    bill_date = DateTime(load_from='billDate')
    amount_to_pay = Integer(load_from='amountToPay')
    account_number_jkh = String(load_form='accountNumberJkh')
    address_user_jkh = Nested(AddressJKHSchema, load_from='addressUserJkh')
    purpose = String()
    kbk = String()
    oktmo = String()
    inn = String()
    kpp = String()
    bik = String()
    payee_corr_account = String(load_from='payeeCorrAccount')
    account_number = String(load_from='accountNumber')
    payee_name = String(load_from='payeeName')
    div_id = Integer(load_from='divID')
    amount = Integer()
    pay_period = Nested(PayPeriodSchema, load_from='payPeriod')
    payer_identifier = String(load_from='payerIdentifier')
    payer_name = String(load_from='payerName')
    treasure_branch = String(load_from='treasureBranch')
    additional_data = Nested(AdditionalDataSchema, load_from='additionalData')
    payment_data = Nested(PaymentDataSchema, load_from='paymentData')

    @pre_load
    def pre_load(self, data, **kwargs):
        if 'additionalData' in data and not isinstance(data.get('additionalData'), dict):
            del data['additionalData']
        return data


class ChargeSchema(BaseDataClassSchema[Charge]):
    document = Nested(DocumentSchema, load_from='payerDoc')
    unified_payer_identifier = String(load_from='unifiedPayerIdentifier')
    department = EnumField(DepartmentType, by_value=True, load_from='depType')
    supplier_bill_id = String(load_from='supplierBillID')
    main_supplier_bill_id = List(String(load_from='mainSupplierBillID'))
    payment_document_id = String(load_from='paymentDocumentID')
    charge_data = Nested(ChargeDataSchema, load_from='chargeData')


class SearchRequestSchema(BaseDataClassSchema[SearchRequest]):
    documents = List(Nested(DocumentSchema), required=True, validate=Length(min=1), dump_to='payerDoc')
    department = EnumField(DepartmentType, required=True, by_value=True, dump_to='depType')
    subscribe = String(required=False)


class SearchResponseSchema(BaseDataClassSchema[SearchResponse]):
    status = EnumField(SearchStatus, load_by=EnumField.VALUE)
    charges = List(Nested(ChargeSchema))


class MpiExtInfoSchema(BaseDataClassSchema[MpiExtInfo]):
    notification_url = String(dump_to='notificationURL')
    browser_accept_header = String(dump_to='browserAcceptHeader')
    browser_color_depth = Integer(dump_to='browserColorDepth')
    browser_ip = String(dump_to='browserIp')
    browser_language = String(dump_to='browserLanguage')
    browser_screen_height = Integer(dump_to='browserScreenHeight')
    browser_screen_width = Integer(dump_to='browserScreenWidth')
    browser_tz = String(dump_to='browserTz')
    browser_user_agent = String(dump_to='browserUserAgent')
    device_channel = EnumField(DeviceChannel, dump_by=EnumField.VALUE, dump_to='deviceChannel')
    browser_java_enabled = Boolean(dump_to='browserJavaEnabled')
    window_width = Integer(dump_to='windowWidth')
    window_height = Integer(dump_to='windowHeight')
    tds_notification_url = String(dump_to='tdsNotificationURL')


class PayerParamsSchema(BaseDataClassSchema[PayerParams]):
    phone = Integer()
    fio = String()
    email = String()
    address = String()
    payer_doc = List(Nested(PayerDoc), dump_to='payerDoc')
    unified_account_number = String(dump_to='unifiedAccountNumber')
    account_number = String(dump_to='accountNumber')
    additional_data = Dict(dump_to='additionalData')


class PaymentParamsSchema(BaseDataClassSchema[PaymentParams]):
    supplier_bill_id = ValueField(dump_to='supplierBillID', load_from='supplierBillID')
    payment_document_id = ValueField(dump_to='paymentDocumentID', load_from='paymentDocumentID')
    packet_advance_payments = List(String, dump_to='packetAdvancePayments', load_from='packetAdvancePayments')
    purpose = String()
    kbk = String()
    oktmo = String()
    inn = String()
    kpp = String()
    bik = String()
    correspondent_bank_account = String(dump_to='correspondentBankAccount', load_from='correspondentBankAccount')
    account_number = String(dump_to='accountNumber', load_from='accountNumber')
    payee_name = String(dump_to='payeeName', load_from='payeeName')
    treasure_branch = String(dump_to='treasureBranch', load_from='treasureBranch')
    ls = String()
    pay_period = Nested(PayPeriodSchema, dump_to='payPeriod', load_from='payPeriod')
    additional_data = Dict(dump_to='additionalData', load_from='additionalData')


class PayRequestSchema(BaseDataClassSchema[PayRequest]):
    order_id = String(required=True, dump_to='orderID')
    kvit = Boolean(required=True)
    payer_params = Nested(PayerParamsSchema, required=True, dump_to='payerParams')
    payment_params = Nested(PaymentParamsSchema, required=True, dump_to='paymentParams')
    sign = String(required=True)
    pay_type = EnumField(PayType, required=True, dump_by=EnumField.VALUE, dump_to='payType')
    dep_type = EnumField(DepartmentType, dump_by=EnumField.VALUE, dump_to='depType')
    amount = Integer()
    total_sum = Integer(dump_to='totalSum')
    payer_id = String(dump_to='payerID')
    card_id = String(dump_to='cardID')
    cryptogram = String()
    mpi_ext_info = NestedJsonStringField(MpiExtInfoSchema, dump_to='mpiExtInfo')
    apple_token = String(dump_to='appleToken')
    gp_token = String(dump_to='gpToken')
    yp_token = String(dump_to='ypToken')
    return_url = String(dump_to='returnUrl')
    return_fail_url = String(dump_to='returnFailUrl')

    @pre_dump
    def create_signature(self, obj: PayRequest, **kwargs: typing.Dict[str, typing.Any]) -> None:
        obj.make_signature()


class TDSSchema(BaseDataClassSchema[TDS]):
    acs_url = String(load_from='acsUrl')
    term_url = String(load_from='termUrl')
    pa_req = String(load_from='paReq')
    creq = String()
    md = String()


class PayResponseSchema(BaseDataClassSchema[PayResponse]):
    payment_id = Integer(required=True, load_from='paymentID')
    redirect_url = String(load_from='redirectUrl')
    tds = Nested(TDSSchema, load_from='3ds')


class PaymentStatusSchema(BaseDataClassSchema[PaymentStatus]):
    code = EnumField(PaymentStatusCode, by_value=True)
    name = String()
    date = Date()
    cancel_reason = String(load_from='cancelReason')


class CardSchema(BaseDataClassSchema[Card]):
    pan = String()
    card_type = String(load_from='cardType')


class PaymentInfoResponseSchema(BaseDataClassSchema[PaymentInfoResponse]):
    payment_id = Integer(load_from='paymentID')
    order_id = String(load_from='orderID')
    uip = String()
    status = Nested(PaymentStatusSchema)
    dep_type = EnumField(DepartmentType, load_from='depType', load_by=EnumField.VALUE)
    kvit = Boolean()
    amount = Integer()
    total_sum = Integer(load_from='totalSum')
    pay_type = EnumField(PayType, load_from='payType', load_by=EnumField.VALUE)
    payment_params = Nested(PaymentParamsSchema, load_from='paymentParams')
    card = Nested(CardSchema)
    result = List(Dict)
    additional_data = Dict(load_from='additionalData')


class SubscriptionInfoResponseSchema(BaseDataClassSchema[SubscriptionInfoResponse]):
    documents = List(Nested(DocumentSchema), load_from='payerDoc')


class UnsubscribeRequestSchema(BaseDataClassSchema[UnsubscribeRequest]):
    subscription_id = String(required=True, dump_to='subscribe')
    documents = List(Nested(DocumentSchema), required=True, dump_to='payerDoc')
