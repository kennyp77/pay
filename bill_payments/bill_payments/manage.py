from sendr_cmncommands import CLI
from sendr_cmncommands import commands as cmncommands

from pay.bill_payments.bill_payments import commands
from pay.bill_payments.bill_payments.utils.cli import create_shell_context

predefined_commands = [
    cmncommands.shell_command(create_shell_context),
]

cli = CLI(commands, predefined_commands, help="Type 'manage.py <subcommand>' to run specific subcommand.")


if __name__ == '__main__':
    cli()
