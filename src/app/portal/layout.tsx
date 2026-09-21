import { requireClient } from '@/modules/auth/session';
import { ClientNav } from '@/components/client-nav';

export default async function PortalLayout({children}:{children:React.ReactNode}){
 const {client}=await requireClient();
 return <><ClientNav name={client.name}/><div className="client-portal-layout">{children}</div></>;
}
