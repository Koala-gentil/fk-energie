# Calcul 3CL complet (annexe 1, §2, §6, §8, §9, §12, §18) pour la maison de référence 100 m², H1a < 400 m
months=['jan','fev','mar','avr','mai','sep','oct','nov','dec']
DH19=[11712.4,9966.8,7922.7,5877.4,2762.0,2264.1,3645.4,6861.0,9573.3]
E   =[38.36,37.47,77.61,86.79,53.63,54.18,61.45,43.04,34.26]
Nref=[744,672,738,695,438,402,644,715,744]
# C1 H1a vertical (>=75°): Sud, Ouest, Nord, Est (mois chauffe)
C1={'S':[1]*9,
    'O':[0.43,0.47,0.58,0.79,1.05,0.76,0.58,0.42,0.38],
    'N':[0.31,0.32,0.37,0.50,0.65,0.41,0.32,0.36,0.25],
    'E':[0.40,0.51,0.63,0.84,1.01,0.66,0.47,0.51,0.35]}
Sh=100; Hsp=2.5
Nmax=0.025*Sh; Nadeq=1.75+0.3*(Nmax-1.75) if Nmax>=1.75 else Nmax
Aw=16.67
def calc(GV,Sw,inertie=2.9,I0=0.84,Rg=0.87,Re=0.95,Rd=1.0,Rr=0.8, part=1.0):
    Bch=0; Bhp=0
    for j in range(9):
        Sse=sum(Aw/4*Sw*1.0*C1[o][j] for o in 'SONE')
        As=1000*Sse*E[j]
        Ai=((3.18+0.34)*Sh+90*132/168*Nadeq)*Nref[j]
        X=(As+Ai)/(GV*DH19[j])
        F=(X-X**inertie)/(1-X**inertie) if X!=1 else 0
        Bch+=GV*(1-F)*DH19[j]/1000
        Bhp+=GV*DH19[j]/1000
    G=GV/(Hsp*Sh)
    INT=I0/(1+0.1*(G-1))
    Ich=1/(Rg*Re*Rd*Rr)
    Cch=part*Bch*INT*Ich
    return dict(GV=GV,G=round(G,3),Bhp=round(Bhp),Bch=round(Bch),F=round(1-Bch/Bhp,3),INT=round(INT,3),Cch=round(Cch),Cch_sansRr=round(part*Bch*INT/Rg), kg=round(Cch/4.6), kg_sansRr=round(part*Bch*INT/Rg/4.6))
site=lambda G: G*250*2592.6*24/1000
cases=[('<1975 jamais isolee',662.5,0.52),('<1975 renovee',487.5,0.38),('1975-82',367.5,0.47),('1983-88',315.2,0.44),('1975-88 (G1.35)',337.5,0.455),('1989-2000',274.7,0.44),('2001-05',235.7,0.38),('2006-12',198.9,0.38),('2001-12 (G0.9)',225,0.38),('>=2013',161.0,0.38)]
print('Nadeq',Nadeq)
for n,GV,Sw in cases:
    r=calc(GV,Sw); s=site(GV/250)
    print(f"{n:22s} GV={GV:6.1f} site_besoin={s:7.0f} site_kg={s/(4.6*0.87):6.0f} | 3CL BV*DH19={r['Bhp']:6d} Bch={r['Bch']:6d} (F moy {r['F']}) INT={r['INT']} Cch={r['Cch']:6d} kg={r['kg']:5d} | sans Re/Rr: kg={r['kg_sansRr']:5d}  ratio site/3CL(sansRr)={s/(4.6*0.87)/r['kg_sansRr']:.2f} ratio site/3CL(complet)={s/(4.6*0.87)/r['kg']:.2f}")
print()
print("Facteurs par classe (site actuel -> 3CL)")
cls=[('ancienne',2.65,0.52),('ancienne-renovee',1.95,0.38),('annees-80',1.35,0.455),('annees-90',1.1,0.44),('annees-2000',0.9,0.38),('recente',0.65,0.38)]
for n,G,Sw in cls:
    GV=G*250
    r=calc(GV,Sw)
    site_b=GV*2592.6*24/1000
    kb=r['Bch']/site_b
    print(f"{n:17s} (1-F)*DH19/DJU18x24={kb:.3f} INT={r['INT']} k_sansRr={kb*r['INT']:.3f} k_complet={kb*r['INT']/(0.95*0.8):.3f}  kg100: site={site_b/(4.6*.87):.0f} 3CL={r['kg']} sansRr={r['kg_sansRr']}  sacs 3CL={r['kg']/15:.0f}")
# chaudière: radiateurs eau HT reseau isolé, robinets thermo, central regul pièce par pièce, I0 0.88 (lég/moy, absent)
for n,G,Sw in cls[2:3]:
    GV=G*250; r=calc(GV,Sw,I0=0.88,Rg=0.94,Re=0.95,Rd=0.92,Rr=0.95)
    print('chaudiere 3CL Rpn', n, r['kg'], 'kg')
