const user = await getUserFromRequest(req);
if (user && stage === 'CLOSED_WON') await addXP(user.id, 'close_deal');
