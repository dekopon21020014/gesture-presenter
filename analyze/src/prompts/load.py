import os

def load_prompt(file_name: str, **kwargs) -> str:
    path = os.path.join(os.path.dirname(__file__), file_name)
    with open(path, "r", encoding="utf-8") as file:
        template = file.read()
    return template.format(**kwargs)