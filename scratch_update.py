import zipfile, xml.etree.ElementTree as ET, re, json

def col2idx(col_str):
    num = 0
    for c in col_str:
        num = num * 26 + (ord(c.upper()) - ord('A')) + 1
    return num - 1

def read_xlsx_exact(filename):
    with zipfile.ZipFile(filename) as z:
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for elem in tree.iter():
                if elem.tag.endswith('t'):
                    shared_strings.append(elem.text or '')
                elif elem.tag.endswith('r'):
                    t_nodes = elem.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')
                    if t_nodes:
                        shared_strings.append(''.join([t.text or '' for t in t_nodes]))
        
        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in sheet_tree.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
            row_dict = {}
            for cell in row.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
                ref = cell.attrib.get('r', '')
                match = re.match(r'([A-Z]+)(\d+)', ref)
                if match:
                    col_str = match.group(1)
                    c_idx = col2idx(col_str)
                else:
                    c_idx = len(row_dict)
                
                val_type = cell.attrib.get('t')
                val_elem = cell.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
                if val_elem is not None and val_elem.text is not None:
                    val = val_elem.text
                    if val_type == 's' and int(val) < len(shared_strings):
                        val = shared_strings[int(val)]
                    row_dict[c_idx] = val
            rows.append(row_dict)
        return rows

generic_icons = {
    'id-11134207-822wr-mlfrlwfobawzb5',
    'id-11134207-822wi-mlfrlwfocphf6a',
    'id-11134207-822wh-modu23deld6pb1',
    'sg-11134201-824ih-mpk6o0k63fnx1b'
}

def is_valid_img(url):
    if not url or 'http' not in url:
        return False
    for g in generic_icons:
        if g in url:
            return False
    return True

media = read_xlsx_exact('mass_update_media_info_829432638_20260826122524.xlsx')

# Index media rows
media_by_code = {}
media_by_name = {}

for idx, r in enumerate(media[6:], start=6):
    row_text = ' '.join([str(v) for v in r.values()])
    codes = re.findall(r'\(L-(\d+)\)', row_text)
    for code in codes:
        if code not in media_by_code:
            media_by_code[code] = []
        media_by_code[code].append(r)
    
    prod_name = r.get(3, '') or r.get(4, '')
    if prod_name:
        clean_name = prod_name.strip().lower()
        if clean_name not in media_by_name:
            media_by_name[clean_name] = []
        media_by_name[clean_name].append(r)

with open('products.json', 'r', encoding='utf-8') as f:
    products_data = json.load(f)

products = products_data['products']

title_cleaned_count = 0
image_updated_count = 0

for p in products:
    old_name = p['name']
    old_img = p['image']
    
    # Check variation type BEFORE cleaning name
    var_type = None
    if re.search(r'\s*-\s*(Lower\s*Tank|LowerTank)$', old_name, re.I):
        var_type = 'lower'
    elif re.search(r'\s*-\s*(Upper\s*Tank|UpperTank)$', old_name, re.I):
        var_type = 'upper'
    elif re.search(r'\s*-\s*Karet$', old_name, re.I):
        var_type = 'karet'
    elif 'lower tank' in old_name.lower():
        var_type = 'lower'
    elif 'upper tank' in old_name.lower():
        var_type = 'upper'
    elif 'karet' in old_name.lower():
        var_type = 'karet'
    
    # Clean title according to rules:
    # If " - Lower Tank" or " - Upper Tank" remove it. If " - Karet" keep it.
    new_name = old_name
    if re.search(r'\s*-\s*(Lower\s*Tank|Upper\s*Tank|LowerTank|UpperTank)$', old_name, re.I):
        new_name = re.sub(r'\s*-\s*(Lower\s*Tank|Upper\s*Tank|LowerTank|UpperTank)$', '', old_name, flags=re.I).strip()
        title_cleaned_count += 1
    
    p['name'] = new_name
    
    # Extract code (L-xxxx)
    code_m = re.search(r'\(L-(\d+)\)', old_name)
    code = code_m.group(1) if code_m else p.get('partNumber')
    
    matched_rows = media_by_code.get(code, [])
    if not matched_rows:
        base_name_clean = re.sub(r'\s*-\s*.*$', '', old_name).strip().lower()
        matched_rows = media_by_name.get(base_name_clean, [])
    
    best_img = None
    if matched_rows:
        r = matched_rows[0]
        # Collect all valid image URLs in row
        valid_imgs = []
        for c in sorted(r.keys()):
            val = str(r[c])
            if is_valid_img(val) and val not in valid_imgs:
                valid_imgs.append(val)
        
        # Check if row has variation specific images matched to text
        var_img_map = {}
        for c in sorted(r.keys()):
            val = str(r[c])
            val_lower = val.lower()
            if 'lower' in val_lower or 'upper' in val_lower or 'karet' in val_lower:
                # check nearby cols for valid img
                for offset in [1, -1, 2, -2, 3, -3]:
                    nc = c + offset
                    if nc in r and is_valid_img(str(r[nc])):
                        v_type = 'lower' if 'lower' in val_lower else ('upper' if 'upper' in val_lower else 'karet')
                        if v_type not in var_img_map:
                            var_img_map[v_type] = str(r[nc])
                        break
        
        if var_type and var_type in var_img_map:
            best_img = var_img_map[var_type]
        elif var_type == 'lower' and len(valid_imgs) >= 1:
            best_img = valid_imgs[0]
            if len(valid_imgs) > 1 and ('upper' in old_name.lower() or 'lower' in old_name.lower()):
                if var_type == 'lower' and 'upper' in old_name.lower():
                    best_img = valid_imgs[1] if len(valid_imgs) > 1 else valid_imgs[0]
        elif valid_imgs:
            best_img = valid_imgs[0]
        else:
            if 5 in r and 'http' in str(r[5]):
                best_img = str(r[5])
            elif 6 in r and 'http' in str(r[6]):
                best_img = str(r[6])
    
    if best_img and best_img != old_img:
        p['image'] = best_img
        image_updated_count += 1

print(f"Titles cleaned: {title_cleaned_count}")
print(f"Images updated: {image_updated_count}")

with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(products_data, f, ensure_ascii=False, indent=2)

js_content = "window.PRODUCTS_DATA = " + json.dumps(products_data, ensure_ascii=False, indent=2) + ";\n"
with open('products.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Saved updated products.json and products.js successfully!")
