import PyPDF2

def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text += page.extract_text()
    
    with open('resume_text.txt', 'w', encoding='utf-8') as text_file:
        text_file.write(text)

extract_text_from_pdf('RESUME.pdf')
