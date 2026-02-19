import re
import sys
import os


# SQL → JS ES5
def sql_to_js_es5(sql_text):
    lines = sql_text.strip().splitlines()
    js_lines = []

    js_lines.append("var sql =")
    js_lines.append('    "" +')

    for i, line in enumerate(lines):
        clean_line = line.rstrip()
        escaped = clean_line.replace('"', '\\"')

        if i == len(lines) - 1:
            js_lines.append(f'    "{escaped}"')
        else:
            js_lines.append(f'    "{escaped} " +')

    js_lines[-1] += ";"

    return "\n".join(js_lines)


# JS ES5 → SQL (Formatted)
def js_es5_to_sql(js_text):
    import re

    # --- Remove JS wrapper ---
    js_text = re.sub(r'var\s+sql\s*=\s*', '', js_text)
    js_text = js_text.strip().rstrip(';')

    parts = re.findall(r'"(.*?)"', js_text, re.DOTALL)
    sql = "".join(parts)

    sql = re.sub(r'\s+', ' ', sql).strip()

    # --- Add newline before major keywords ---
    keywords = [
        "SELECT", "FROM", "WHERE",
        "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN",
        "GROUP BY", "ORDER BY", "HAVING",
        "UNION", "ON"
    ]

    for kw in sorted(keywords, key=len, reverse=True):
        sql = re.sub(r'\b' + kw + r'\b', r'\n' + kw, sql, flags=re.IGNORECASE)

    # --- Smart Formatter ---
    result = []
    indent = 0
    depth = 0  # parenthesis depth
    i = 0

    while i < len(sql):
        ch = sql[i]

        # Open parenthesis
        if ch == '(':
            result.append(ch)
            depth += 1
            indent += 1
            result.append('\n' + '    ' * indent)

        # Close parenthesis
        elif ch == ')':
            depth -= 1
            indent -= 1
            result.append('\n' + '    ' * indent + ch)

        # Comma handling
        elif ch == ',':
            if depth == 0:
                # top-level comma (new column)
                result.append(',\n' + '    ' * indent)
            else:
                # inside function
                result.append(',\n' + '    ' * indent)

        else:
            result.append(ch)

        i += 1

    formatted = "".join(result)

    # clean multiple blank lines
    formatted = re.sub(r'\n\s*\n', '\n', formatted)

    return formatted.strip()




def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_file(path, content):
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


if __name__ == "__main__":

    if len(sys.argv) < 4:
        print("Usage:")
        print("  python main.py sql2js input.sql output.js")
        print("  python main.py js2sql input.js output.sql")
        sys.exit(1)

    mode = sys.argv[1]
    input_path = sys.argv[2]
    output_path = sys.argv[3]

    if not os.path.exists(input_path):
        print("❌ Input file not found")
        sys.exit(1)

    content = read_file(input_path)

    if mode == "sql2js":
        result = sql_to_js_es5(content)
    elif mode == "js2sql":
        result = js_es5_to_sql(content)
    else:
        print("❌ Unknown mode. Use sql2js or js2sql")
        sys.exit(1)

    write_file(output_path, result)

    print("✅ Convert Success")
    print("📂 Input :", input_path)
    print("💾 Output:", output_path)
