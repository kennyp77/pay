from typing import Optional
from uuid import UUID

from pay.bill_payments.bill_payments.interactions.kazna.entities import Charge
from pay.bill_payments.bill_payments.storage.entities.bill import Bill, BillStatus


def charge_to_bill(uid: int, charge: Charge, document_id: UUID, bill_id: Optional[UUID] = None) -> Bill:
    assert charge.department
    assert charge.charge_data
    assert charge.charge_data.amount
    assert charge.charge_data.amount_to_pay
    bill = Bill(
        bill_id=bill_id,
        uid=uid,
        supplier_bill_id=charge.supplier_bill_id,
        document_id=document_id,
        status=BillStatus.NEW,
        amount=charge.charge_data.amount,
        amount_to_pay=charge.charge_data.amount_to_pay,
        bill_date=charge.charge_data.bill_date,
        purpose=charge.charge_data.purpose,
        kbk=charge.charge_data.kbk,
        oktmo=charge.charge_data.oktmo,
        inn=charge.charge_data.inn,
        kpp=charge.charge_data.kpp,
        bik=charge.charge_data.bik,
        account_number=charge.charge_data.account_number,
        payee_name=charge.charge_data.payee_name,
        payer_name=charge.charge_data.payer_name,
        div_id=charge.charge_data.div_id,
        treasure_branch=charge.charge_data.treasure_branch,
        dep_type=charge.department,
    )

    if additional_data := charge.charge_data.additional_data:
        bill.discount_date = additional_data.discount_date
        bill.discount_size = additional_data.discount_size
        bill.legal_act = additional_data.legal_act
        bill.offense_name = additional_data.offense_name
        bill.offense_place = additional_data.offense_place
        bill.offense_date = additional_data.offense_date

    if payment_data := charge.charge_data.payment_data:
        bill.paid_amount = payment_data.sum
        bill.paid_date = payment_data.date

    return bill
