import cv2,glob,os,json,numpy as np
res={}
for g in sorted(glob.glob('assets/gfx/*.webp')):
    n=os.path.basename(g)[:-5]; G=cv2.imread(g,0)
    fp=f'assets/faces/{n}.png'
    if not os.path.exists(fp): res[n]=None; print(n,'no face'); continue
    F=cv2.imread(fp,0); best=(-1,)
    for s in np.linspace(0.3,2.0,35):
        T=cv2.resize(F,None,fx=s,fy=s)
        if T.shape[0]>=G.shape[0] or T.shape[1]>=G.shape[1]: continue
        r=cv2.matchTemplate(G,T,cv2.TM_CCOEFF_NORMED); _,mv,_,ml=cv2.minMaxLoc(r)
        if mv>best[0]: best=(mv,s,ml,T.shape)
    mv,s,(x,y),(h,w)=best
    res[n]=dict(cx=(x+w/2)/G.shape[1],cy=(y+h/2)/G.shape[0],w=w/G.shape[1],score=round(float(mv),3))
    print(n,res[n])
json.dump(res,open('tools/faces.json','w'),indent=1)
