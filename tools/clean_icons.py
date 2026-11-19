import cv2,numpy as np
for n in ['Speed','Power','Guts','Wit','Stamina']:
    im=cv2.imread(f'assets/icons/{n}.png',cv2.IMREAD_UNCHANGED)
    if im.shape[2]==3: im=cv2.cvtColor(im,cv2.COLOR_BGR2BGRA)
    a=im[:,:,3].copy()
    dark=((im[:,:,:3].max(2)<70)|(a<20)).astype(np.uint8)
    n_,lab=cv2.connectedComponents(dark)
    border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))
    bg=np.isin(lab,[l for l in border if dark[lab==l].any()])
    alpha=np.where(bg,0,a).astype(np.uint8)
    alpha=cv2.erode(alpha,np.ones((5,5),np.uint8))
    alpha=cv2.GaussianBlur(alpha,(0,0),1.6)
    im[:,:,3]=alpha
    ys,xs=np.where(alpha>8); im=im[ys.min():ys.max()+1,xs.min():xs.max()+1]
    cv2.imwrite(f'assets/icons/{n}.png',im); print(n,im.shape)
