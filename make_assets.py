from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit
from reportlab.lib.pagesizes import A4
import math, random
root=Path(__file__).resolve().parent
assets=root/'assets'
assets.mkdir(exist_ok=True)

# OpenGraph preview for messaging/social sharing (does not use or invent a portrait)
w,h=1200,630
im=Image.new('RGB',(w,h),'#080910')
d=ImageDraw.Draw(im)
for x in range(0,w,28):
 for y in range(0,h,28):d.ellipse((x,y,x+1,y+1),fill=(31,33,45))
# Neon orbital globe
cx,cy=918,310
for ring in range(4):
 r=146+ring*34
 clr=[(109,103,179),(80,112,128),(76,105,80),(56,72,79)][ring]
 d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=clr,width=2)
for i in range(520):
 a=(i*2.399963229728653); yy=1-(i/519)*2; rr=(1-yy*yy)**.5
 x=cx+rr*math.cos(a)*154;y=cy+yy*154
 shade=170+int(35*rr)
 d.ellipse((x,y,x+2,y+2),fill=(160,152,shade))
# More galaxy accent
for i in range(65):
 x=720+i*17%440;y=(17*i*i+113)%620
 d.ellipse((x,y,x+1,y+1),fill=(120,119,140))
reg='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
headline=ImageFont.truetype(bold,67); small=ImageFont.truetype(bold,17); medium=ImageFont.truetype(reg,24)
d.rounded_rectangle((74,68,132,126),radius=12,fill='#171921',outline='#525866',width=2)
d.text((82,84),'R/S',font=ImageFont.truetype(bold,24),fill='#c3ff82')
d.text((76,163),'RISHAV KUMAR SINGH',font=small,fill='#c3ff82',spacing=4)
d.text((70,222),'I bridge',font=headline,fill='#f6f4f3')
d.text((70,312),'technology',font=headline,fill='#f6f4f3')
d.text((70,400),'& business impact.',font=ImageFont.truetype(bold,55),fill='#c3ff82')
d.line((75,513,526,513),fill='#484a56',width=2)
d.text((75,535),'TECHNOLOGY  /  BUSINESS  /  AI',font=medium,fill='#a5a7b6')
im.save(assets/'social-cover.png',optimize=True)

# Single-page, public-safe résumé; deliberately excludes telephone number.
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
path=assets/'Rishav_Kumar_Singh_Public_Resume.pdf'
c=canvas.Canvas(str(path),pagesize=A4,pageCompression=1)
W,H=A4
M=42
c.setFillColor(HexColor('#0B0E16'));c.rect(0,H-127,W,127,stroke=0,fill=1)
c.setFillColor(HexColor('#C3FF82'));c.setFont('DejaVuBold',9);c.drawString(M,H-35,'TECHNOLOGY  /  BUSINESS  /  AI')
c.setFillColor(HexColor('#FFFFFF'));c.setFont('DejaVuBold',24);c.drawString(M,H-68,'Rishav Kumar Singh')
c.setFillColor(HexColor('#D0D3DE'));c.setFont('DejaVu',9);c.drawString(M,H-90,'Bengaluru, India  •  rishav19.90.rk@gmail.com')
c.setFont('DejaVu',7.6)
c.drawString(M,H-109,'github.com/RKRISHAV  |  linkedin.com/in/rishav-singh-68871925b  |  leetcode.com/u/Rishav0025')
y=H-150

def section(name):
 global y
 c.setFillColor(HexColor('#435F32'));c.setFont('DejaVuBold',9.5);c.drawString(M,y,name.upper());y-=10
 c.setStrokeColor(HexColor('#D8DDD5'));c.setLineWidth(.6);c.line(M,y,W-M,y);y-=17

def line(s,indent=0,font='DejaVu',size=8.2,color='#27303A',leading=13,maxwidth=None):
 global y
 c.setFont(font,size);c.setFillColor(HexColor(color))
 for ln in simpleSplit(s,font,size,maxwidth or W-2*M-indent):
  c.drawString(M+indent,y,ln);y-=leading

def role(title,org,dates,bullets):
 global y
 c.setFillColor(HexColor('#151C23'));c.setFont('DejaVuBold',9);c.drawString(M,y,title)
 c.setFont('DejaVu',7.8);c.setFillColor(HexColor('#5D6474'));c.drawRightString(W-M,y,dates)
 y-=14
 line(org,size=8,color='#4E5964',leading=14)
 for bullet in bullets:line('•  '+bullet,indent=5,size=7.8,leading=12)
 y-=9

section('Profile')
line('Computer Science engineer combining consultative business development, high-accountability sales execution, and hands-on AI and backend engineering. Strong at connecting technical products to user needs and measurable outcomes.',size=8.1,leading=13)
y-=10
section('Commercial impact')
line('•  Delivered ₹5.7L against a ₹2.5L monthly goal (+128% above target) at PW Skills.',size=8.1)
line('•  Delivered ₹5.4L against a ₹3.1L goal (+74% above target) in another month.',size=8.1)
line('•  Experience with lead qualification, discovery, multi-channel follow-ups and CRM hygiene.',size=8.1)
y-=10
section('Experience')
role('Admissions Counsellor – Associate','upGrad School of Technology · Bengaluru','Apr 2026 – Present',[
'Guide prospective students and parents through program decisions, needs assessment and enrollment follow-up.',
'Connect technical learning outcomes with individual career goals through consultative conversations.'])
role('Business Development Associate','PW Skills (Physics Wallah) · Bengaluru','Jun 2025 – Oct 2025',[
'Exceeded monthly sales goals; developed structured outbound/inbound contact and objection-handling workflows.',
'Used Salesforce and HubSpot to maintain high-volume lead activity and organized follow-up.'])
section('Selected technical work')
line('Catalyst AI Chatbot  |  AI-powered program information assistant · Live: chat-bot-sot.streamlit.app',font='DejaVuBold',size=8,leading=13)
line('Document Q&A  |  RAG pipeline with document ingestion, semantic retrieval, FastAPI and LLM API integration.',size=7.8)
line('Role-Based Task Manager  |  React, FastAPI, PostgreSQL, JWT, RBAC and 15+ REST endpoints.',size=7.8)
line('Smart Attendance  |  OpenCV, ResNet-34-based facial embeddings and real-time recognition.',size=7.8)
y-=9
section('Skills & recognition')
line('Business: consultative sales, lead qualification, discovery, pipeline management, Salesforce, HubSpot.',size=7.8)
line('Technology: Python, FastAPI, React, SQL, PostgreSQL, RAG, OpenCV, Git.',size=7.8)
line('Research: Springer ComSIA-2025 co-author/presenter; AI AlChemy 2024 first runner-up.',size=7.8)
line('Education: B.Tech Computer Science & Engineering — KIIT, Bhubaneswar (2021–2025; 7.5 CGPA).',size=7.8)
if y<30:print('WARN: resume overflow',y)
c.setFillColor(HexColor('#A1A4AA'));c.setFont('DejaVu',7);c.drawString(M,24,'Portfolio résumé · Public version without a phone number')
c.save()
print('RESUME last y',y, 'PDF path',path,'cover',assets/'social-cover.png')
