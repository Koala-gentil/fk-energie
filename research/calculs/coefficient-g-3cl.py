import math, json, sys
Sh=100.0; Hsp=2.5; V=Sh*Hsp
side=math.sqrt(50); 
def interp(x, xs, ys):
    # xs descending (Upb columns); linear interp/extrap between nearest two
    pts=sorted(zip(xs,ys))
    xs2=[p[0] for p in pts]; ys2=[p[1] for p in pts]
    if x<=xs2[0]: i=0
    elif x>=xs2[-1]: i=len(xs2)-2
    else:
        i=max(j for j in range(len(xs2)-1) if xs2[j]<=x)
    x0,x1,y0,y1=xs2[i],xs2[i+1],ys2[i],ys2[i+1]
    return y0+(x-x0)*(y1-y0)/(x1-x0)
VS_cols=[3.33,1.43,0.83,0.45,0.41,0.37,0.34,0.31]
VS={4:[0.43,0.4,0.37,0.34,0.31,0.29,0.27,0.25],5:[0.38,0.36,0.34,0.32,0.3,0.28,0.26,0.25]}
def Ue_vs(upb,r): return interp(upb,VS_cols,VS[r])

# roof geometry 45 deg two slopes
half=side/2; roof=2*side*(half/math.cos(math.radians(45))); gable=0.5*side*half
Aw_win=100/6.0; A_door=2.0
L_win=10*2*(1.20+Aw_win/10/1.20)  # 10 baies of 1.20 wide
L_door=2*2.2+0.9
def b_combles(isolated_ceiling, Aue):
    r=50/Aue
    assert 0.5<r<=0.75, r
    return 1.00 if isolated_ceiling else 0.85   # UV,ue=9 (fortement ventilé)
vent={ # name: (Qvarep,Qvasouf,Smea)
 'fenetres':(1.2,1.2,0),
 'conduit':(2.23,0,4),
 'SFauto<82':(1.97,0,2),'SFauto82-00':(1.65,0,2),'SFauto01-12':(1.50,0,2),
 'hygroB01-12':(1.24,0,1.5),'hygroB>12':(1.09,0,1.5),'hygroA>12':(1.16,0,2),
}
def DR(q4conv,Sdep,vt):
    qrep,qsouf,smea=vent[vt]; e,f=0.07,15
    Hvent=0.34*qrep*Sh
    Q4=q4conv*Sdep+0.45*smea*Sh
    n50=Q4/((4/50)**(2/3)*Hsp*Sh)
    Qinf=Hsp*Sh*n50*e/(1+f/e*((qsouf-qrep)/(Hsp*n50))**2)
    return dict(Q4=Q4,n50=n50,Qvinf=Qinf,Hvent=Hvent,Hperm=0.34*Qinf)
def calc(c, mit=False):
    nfac=3 if mit else 4
    P=side*nfac; Awall_gross=P*2*Hsp
    Aop=Awall_gross-Aw_win-A_door
    r=round(2*50/P)
    Ue=Ue_vs(c['Upb'],r)
    Aue=roof+gable*(1 if mit else 2)
    bc=b_combles(c['ceil_iso'],Aue)
    parts={}
    parts['murs']=(Aop,c['Umur'],1.0)
    parts['plafond']=(50.0,c['Uph'],bc)
    parts['plancher']=(50.0,Ue,1.0)
    parts['fenetres']=(Aw_win,c['Uw'],1.0)
    parts['porte']=(A_door,c['Uporte'],1.0)
    DP={k:v[0]*v[1]*v[2] for k,v in parts.items()}
    PT={'pb/mur':c['kpb']*P,'pi/mur':c['kpi']*P,'men/mur':c['kmen']*(L_win+L_door),
        'refend(mitoyen)':(0.5*c['krf']*2*2*Hsp if mit else 0.0)}
    Sdep=Awall_gross+50
    d=DR(c['q4'],Sdep,c['vent'])
    H=sum(DP.values())+sum(PT.values())+d['Hvent']+d['Hperm']
    return dict(P=P,r=r,Ue=Ue,bc=bc,Aop=Aop,Sdep=Sdep,Aue=Aue,parts=parts,DP=DP,PT=PT,DR=d,H=H,G=H/V,Pkw=H*28.5/1000)
cases=[
 dict(id='pre48_ni',lab='≤1947 jamais isolée',Umur=2.5,Uph=2.5,ceil_iso=False,Upb=2.0,Uw=5.4,Uporte=3.5,kpb=0.39,kpi=0,kmen=0.31,krf=0.73,q4=3.3,vent='fenetres'),
 dict(id='4874_ni',lab='1948-1974 jamais isolée',Umur=2.5,Uph=2.5,ceil_iso=False,Upb=2.0,Uw=5.4,Uporte=3.5,kpb=0.39,kpi=0,kmen=0.31,krf=0.73,q4=2.2,vent='fenetres'),
 dict(id='pre48_r',lab='≤1947 rénovée',Umur=2.5,Uph=0.14,ceil_iso=True,Upb=2.0,Uw=1.4,Uporte=3.5,kpb=0.39,kpi=0,kmen=0.31,krf=0.73,q4=2.0,vent='fenetres'),
 dict(id='4874_r',lab='1948-1974 rénovée',Umur=2.5,Uph=0.14,ceil_iso=True,Upb=2.0,Uw=1.4,Uporte=3.5,kpb=0.39,kpi=0,kmen=0.31,krf=0.73,q4=1.9,vent='fenetres'),
 dict(id='4874_r_uk',lab='1948-1974 rénovée (date isol. combles inconnue)',Umur=2.5,Uph=0.5,ceil_iso=True,Upb=2.0,Uw=1.4,Uporte=3.5,kpb=0.39,kpi=0,kmen=0.31,krf=0.73,q4=1.9,vent='fenetres'),
 dict(id='7577',lab='1975-1977',Umur=1.0,Uph=0.5,ceil_iso=True,Upb=0.9,Uw=3.4,Uporte=3.5,kpb=0.71,kpi=0.92,kmen=0,krf=0.82,q4=1.9,vent='SFauto<82'),
 dict(id='7882',lab='1978-1982',Umur=1.0,Uph=0.5,ceil_iso=True,Upb=0.9,Uw=3.4,Uporte=3.5,kpb=0.71,kpi=0.92,kmen=0,krf=0.82,q4=1.9,vent='SFauto<82'),
 dict(id='8388',lab='1983-1988',Umur=0.8,Uph=0.3,ceil_iso=True,Upb=0.8,Uw=2.7,Uporte=3.5,kpb=0.71,kpi=0.92,kmen=0,krf=0.82,q4=1.9,vent='SFauto82-00'),
 dict(id='8900',lab='1989-2000',Umur=0.5,Uph=0.25,ceil_iso=True,Upb=0.5,Uw=2.7,Uporte=3.5,kpb=0.71,kpi=0.92,kmen=0,krf=0.82,q4=1.9,vent='SFauto82-00'),
 dict(id='0105',lab='2001-2005',Umur=0.4,Uph=0.23,ceil_iso=True,Upb=0.3,Uw=1.6,Uporte=3.5,kpb=0.71,kpi=0.92,kmen=0,krf=0.82,q4=1.9,vent='SFauto01-12'),
 dict(id='0612',lab='2006-2012',Umur=0.36,Uph=0.2,ceil_iso=True,Upb=0.27,Uw=1.4,Uporte=1.5,kpb=0.71,kpi=0.92,kmen=0,krf=0.82,q4=1.3,vent='hygroB01-12'),
 dict(id='13',lab='≥2013',Umur=0.23,Uph=0.14,ceil_iso=True,Upb=0.23,Uw=1.4,Uporte=1.5,kpb=0.71,kpi=0.92,kmen=0,krf=0.82,q4=0.6,vent='hygroB>12'),
]
print(f"side={side:.3f} P={4*side:.2f} roof={roof:.2f} gable={gable:.2f} Aue={roof+2*gable:.2f} Awin={Aw_win:.2f} Lwin={L_win:.2f} Ldoor={L_door}")
out={}
for c in cases:
    for mit in (False,True):
        R=calc(c,mit); out[(c['id'],mit)]=R
        if not mit:
            print(f"\n== {c['lab']}  Aop={R['Aop']:.2f} 2S/P={R['r']} Ue={R['Ue']:.3f} bcomb={R['bc']} Sdep={R['Sdep']:.2f}")
            for k,v in R['DP'].items(): print(f"  {k:9s} A={R['parts'][k][0]:7.2f} U={R['parts'][k][1]:.3f} b={R['parts'][k][2]:.2f} -> {v:7.2f}")
            for k,v in R['PT'].items(): print(f"  PT {k:12s} {v:7.2f}")
            d=R['DR']; print(f"  Q4={d['Q4']:.1f} n50={d['n50']:.2f} Qvinf={d['Qvinf']:.1f} Hvent={d['Hvent']:.2f} Hperm={d['Hperm']:.2f}")
        print(f"  {'MITOYEN' if mit else 'ISOLEE '} H={R['H']:.1f} W/K  G={R['G']:.3f}  P={R['Pkw']:.2f} kW  (2S/P={R['r']} Ue={R['Ue']:.3f} Sdep={R['Sdep']:.1f})")
# sensitivities
import copy
print("\nSENSIBILITES (maison isolée)")
for cid,mod,lab in [('4874_ni',{'vent':'conduit'},'48-74 NI ventil. naturelle par conduit'),
                    ('pre48_ni',{'vent':'conduit'},'<48 NI ventil. naturelle par conduit'),
                    ('13',{'kpi':0},'≥2013 plancher interm. léger'),('0612',{'kpi':0},'06-12 plancher interm. léger'),
                    ('0105',{'kpi':0},'01-05 plancher interm. léger'),('8900',{'kpi':0},'89-00 plancher interm. léger'),
                    ('7577',{'kpi':0},'75-77 plancher interm. léger'),('8388',{'kpi':0},'83-88 plancher interm. léger'),
                    ('4874_ni',{'Umur':1.0/(1/2.0+0.21)},'48-74 NI brique pleine 34 cm + doublage'),
                    ('4874_ni',{'Uw':3.4*0+5.4,'q4':2.2},'(ref)'),
                    ('13',{'vent':'hygroA>12'},'≥2013 hygro A')]:
    c=copy.deepcopy(next(x for x in cases if x['id']==cid)); c.update(mod)
    R=calc(c); print(f"  {lab:45s} H={R['H']:.1f} G={R['G']:.3f} P={R['Pkw']:.2f} kW")
# windows 15% sensitivity
Aw_win=15.0; L_win=10*2*(1.20+Aw_win/10/1.20)
print("\nFenêtres 15 m2:")
for c in cases:
    R=calc(c); print(f"  {c['lab']:45s} G={R['G']:.3f}")
