"""Render a map (public/assets/maps/<map>.tmj) to a PNG for a quick look.
usage: python3 scripts/preview_map.py <map> <out.png> [px per tile, 16 = full detail] [x0 y0 x1 y1]"""
import json, sys
from PIL import Image
R='/home/tuannv/Scripts/Gland/public/assets/'
mp, out = sys.argv[1], sys.argv[2]
s = int(sys.argv[3]) if len(sys.argv)>3 else 2
d=json.load(open(R+'maps/'+mp+'.tmj')); W,H=d['width'],d['height']
x0,y0,x1,y1 = map(int,sys.argv[4:8]) if len(sys.argv)>7 else (0,0,W,H)
ts=Image.open(R+'tilesets/farm_tiles.png').convert('RGBA'); cols=ts.width//16
cache={}
def tile(g):
    if g not in cache:
        t=ts.crop(((g-1)%cols*16,(g-1)//cols*16,(g-1)%cols*16+16,(g-1)//cols*16+16))
        cache[g]=t.resize((s,s),Image.BOX if s<16 else Image.NEAREST)
    return cache[g]
img=Image.new('RGBA',((x1-x0)*s,(y1-y0)*s),(0,0,0,255))
L={l['name']:l for l in d['layers']}
for name in ('ground','decor'):
    data=L[name]['data']
    for y in range(y0,y1):
        for x in range(x0,x1):
            g=data[y*W+x]
            if g: img.alpha_composite(tile(g),((x-x0)*s,(y-y0)*s))
TREES={61:['oak_1','bamboo','oak_0','areca','oak_1'],7:['oak_0','oak_1','banana'],72:['areca'],81:['pine'],82:['bamboo'],83:['coconut'],84:['mangrove']}
tcache={}
def tree(name):
    if name not in tcache:
        im=Image.open(R+'sprites/trees/'+name+'.png').convert('RGBA')
        tcache[name]=im.resize((max(1,im.width*s//16),max(1,im.height*s//16)),Image.BOX if s<16 else Image.NEAREST)
    return tcache[name]
dec=L['decor']['data']
for y in range(y0,y1):
    for x in range(x0,x1):
        g=dec[y*W+x]
        if g in TREES:
            pool=TREES[g]; h=((x*73856093)^(y*19349663))&0xffffffff
            im=tree(pool[h%len(pool)])
            px=int((x-x0)*s+s/2-im.width/2); py=int((y-y0)*s+s-2*s/16-im.height*60/64)
            img.paste(im,(px,py),im)
pack=json.load(open(R+'sprites/pack.json'))['generated']['files']
url={f['key']:f['url'] for f in pack if 'url' in f}
props=[o for o in L['objects']['objects'] if o['name']=='prop']
props.sort(key=lambda o:(0 if any(p['value']=='floor' for p in o.get('properties',[])) else 1, o['y']+o['height']))
for o in props:
    key=next(p['value'] for p in o['properties'] if p['name']=='sprite')
    tx,ty=o['x']/16,o['y']/16
    if not (x0-12<tx<x1 and y0-12<ty<y1+12): continue
    try: im=Image.open(R+url['prop_'+key]).convert('RGBA')
    except Exception: continue
    sc=s/16; w,h=max(1,int(im.width*sc)),max(1,int(im.height*sc))
    im=im.resize((w,h),Image.BOX if s<16 else Image.NEAREST)
    # sprite bottom aligned to footprint bottom, centered
    px=int((tx-x0)*s+o['width']*sc/2-w/2); py=int((ty-y0)*s+o['height']*sc-h)
    img.alpha_composite(im,(px,py)) if px>=0 and py>=0 else img.paste(im,(px,py),im)
img.convert('RGB').save(out)
print(img.size)
