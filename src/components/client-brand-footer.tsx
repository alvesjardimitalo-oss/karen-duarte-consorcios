export function ClientBrandFooter(){
 const brands=[['O BOTICÁRIO','Perfumaria & beleza'],['NATURA','Bem estar bem'],['AVON','Beleza para todos'],['EUDORA','Beleza que inspira']];
 return <footer className="client-brand-footer"><div><span className="client-brand-kicker">REVENDEDORA AUTORIZADA</span><h3>As marcas que você ama, em um só lugar.</h3><p>Atendimento Karen Martins · Cosméticos & Consórcios</p></div><div className="client-brand-grid">{brands.map(([name,note])=><div className="client-brand-badge" key={name}><strong>{name}</strong><small>{note}</small></div>)}</div></footer>
}