import{NextResponse}from'next/server';import{requireAdminManager}from'@/modules/auth/session';import{syncOfficialMagazines}from'@/modules/magazines/sync-service';
export async function POST(){await requireAdminManager();try{return NextResponse.json(await syncOfficialMagazines())}catch(e:any){return NextResponse.json({error:String(e?.message||e)},{status:500})}}
