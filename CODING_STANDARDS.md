Coding Standards For Senior Project and Software Design (Python)

This document specifies coding standards that I want everyone to use for the Senior Project. In the past, I have written such documents for three different companies. Not every company will have coding standards, but the lack of them can lead to a lot of problems. Sometimes the coding standards are informal. You may find out your company's standards during code reviews.

When coding standards are created, all new code is required to adhere to the standards. (New standards do not usually require that old code be modified to meet them. WHY?) Many companies have periodic code reviews to make sure that people are following the coding standard (among other things). This can occur even if there are no formal coding standards.

The reason that coding standards are created is to support the development of code that is easy to read, debug, maintain, and replace. This standard was originally developed for code written in C and C++, but it is easily adaptable to Python, C#, and Java. There are also tools like Doxygen and Sphinx that support commenting code. You may use them. Just stay consistent with this document.

Note: developing coding standards can cause a lot of fights. As an entry-level programmer, you don't get much choice. If your company has coding standards, you live by them or quit. Some people get very particular about standards. I once had an experienced programmer argue intensely over whether the first letter in a comment should be capitalized.

For more ideas, see the following links:

https://google.github.io/styleguide/pyguide.html

https://google.github.io/styleguide/cppguide.html

https://www.linkedin.com/pulse/avoid-35-habits-lead-unmaintainable-code-christian-maioli-mackeprang

You must abide by this coding standard for your Software Design term project and for your Senior Project. I have edited my original document so that only the relevant material is presented.

Note: this standard is easily applicable to most programming languages. Please try and abide by it.

Documentation / Comments
File Header Information

Each source file (.py) that you create should have header information that describes its purpose.

In Python, this should be done using a module-level docstring at the top of the file.

"""
module_name.py

purpose
    describes what this module does

notes
    any important assumptions or context
"""

Function Documentation (UNIX Man-Page Style)

Within the code, the implementation of a function must be prefaced with the equivalent of a UNIX man page entry. This is not required for very short functions, where a simple comment is sufficient.

In Python, this is done using a docstring directly under the function definition.

def ProcessNewOpens(a_obj, a_capital, a_date):
    """
    NAME
            ProcessNewOpens - processes new opens for this model.

    SYNOPSIS
            ProcessNewOpens(a_obj, a_capital, a_date)
                a_obj       --> the trading object to be opened
                a_capital   --> the amount of capital to apply
                a_date      --> the date being processed

    DESCRIPTION
            this function attempts to open the trading object a_obj with the
            specified amount of capital. before attempting the open, portfolio
            constraints are applied. if constraints are not met, the object
            is opened as a phantom. the constraint may also reduce capital.

            status flags and phantom flags are set appropriately.

    RETURNS
            returns true if the open was successful and false if it was opened
            as a phantom. one of these cases will always occur.
    """
    ...
#def ProcessNewOpens(a_obj, a_capital, a_date):

The commented function signature at the end replaces the C++ requirement to append the prototype after the closing brace and serves the same purpose: identifying the function when the top is not visible.

Documentation tools such as Doxygen or Sphinx may be used as long as the same information is supplied and labels correspond to this document.

Code Comments

Comments within the code should be indented the same amount as the code.

Each block of code performing a well-defined task should be preceded by a blank line and a comment.

Comments should explain intent, not repeat the code.

Do not use comments to explain overly complex code. Rewrite the code.

Comments must always match the code. If the code changes, the comments must change.

Do not wait until the end of the project to write comments.

Ridiculous example (still ridiculous in Python):

#assign taxes the value of withholding
taxes = withholding

Namespaces (Python Equivalent)

To avoid name pollution:

Use modules (.py files) to group related functions and classes.

Use packages (folders with __init__.py) to group modules.

Do not place large numbers of unrelated definitions in the global scope.

Tabs, Spacing, and Formatting

There must be one tab setting for all programmers.

Indentation is 4 spaces

Tabs must be replaced with spaces

Do not mix tabs and spaces

Python relies on indentation for structure, so this rule is critical.

Source Code Control and Testing

For the Senior Project, you must use GIT. Keep repositories private.

The debugger is a test tool, not just a bug-finding tool. Always step through code to verify behavior matches design.

Use testing tools where appropriate:

unit tests

assertions

logging

Always enter meaningful commit messages.

Write test code for modules when possible and check it into source control (for example, in a tests/ directory).

Check in:

dependency files (requirements.txt, pyproject.toml, etc.)

documentation

test code

Programs must log errors and events. If the program terminates abnormally, the reason must be logged and a message displayed.

Defend your code against:

invalid user input

data errors

external system failures

Constants, Variables, and Naming

Constants should be declared at module or class scope.

Constant names should start with a capital letter (or be fully capitalized).

Variable names should begin with a lower-case letter.

Function and class names should begin with an upper-case letter. WHY?

Class-specific constants and enums should live inside the class.

Use enum.Enum for related constants.

Avoid global variables. If unavoidable, prefix them with g_ and group them logically.

All variables must be initialized before use.

self.m_balance

Do not expose variables publicly. Use accessor methods or properties.

Avoid meaningless names like x, i, or n except in extremely local contexts.

Avoid shadowing variables.

Declare variables as close as possible to where they are used.

Functions

Functions should be short.

Functions longer than ~100 lines usually indicate poor design.

Function names must start with an upper-case letter.

Closely related functions should be grouped into the same module.

Avoid hidden shared state.

Parameters should be prefixed with a_.

Treat function arguments as read-only unless modification is explicit.

Functions should be written top-down.

Each function should have one purpose.

Do not duplicate code. Put shared logic into functions.

Classes

Class names start with an upper-case letter.

Class names should usually be nouns.

Classes should represent a well-defined concept.

Avoid trivial classes with no real responsibility.

Classes should manage their own resources.

Use context managers (with) when appropriate.

Keep internal helper methods private (prefix with _).

Use inheritance to extend behavior.

All class variables should be private.

Group related classes into modules or packages.

Code Flow and Readability

Always handle default cases in match statements using case _.

Prefer straight-line control flow.

Avoid deeply nested conditionals.

Bad:

if condA == OK:
    if condB == OK:
        do_something()
        return OK
    else:
        return ErrorB
else:
    return ErrorA

BETTER:

if condA != OK:
    return ErrorA
if condB != OK:
    return ErrorB
do_something()
return OK

Do not compare floating-point values directly for equality.

Use assert only for conditions that cannot logically occur.

Use spaces around binary operators.

Avoid excessive or "clever" code.

Use lists or other collections instead of multiple related variables.

Never copy-paste code. Extract functions instead.

Do not reformat large existing codebases to match your style.

Miscellaneous

Remove unused code.

Test both debug and release configurations.

Avoid excessive callback usage.

Handle all exceptions intentionally.

Do not leave commented-out code in production.

Use standard and approved libraries when possible.

If the project grows large, split it into packages/modules.


IF THERE ARE ANY QUESTIONS, CHECK ANY OF THE OTHER .MD FILES, AND IF IT IS NOT ANSWERED PLEASE ASK ME BEFORE GENERATING CODE.
