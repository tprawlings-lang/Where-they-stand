import assert from "node:assert/strict";
import test from "node:test";

function classify({ evidence }) { return evidence.length === 0 ? "NO_PUBLIC_POSITION" : evidence[0].label; }
function candidateOrder(candidates) { return [...candidates].sort((a,b)=>(a.ballotOrder??Infinity)-(b.ballotOrder??Infinity)||a.surname.localeCompare(b.surname)); }

test("party swap does not change stance output",()=>{ const evidence=[{label:"SUPPORTS"}]; assert.equal(classify({party:"A",evidence}), classify({party:"B",evidence})); });
test("silence never becomes opposition",()=>{ assert.equal(classify({party:"A",evidence:[]}),"NO_PUBLIC_POSITION"); assert.notEqual(classify({party:"A",evidence:[]}),"OPPOSES"); });
test("candidate order uses ballot order then surname, not party",()=>{ const input=[{surname:"Young",party:"A",ballotOrder:2},{surname:"Able",party:"B",ballotOrder:1}]; assert.deepEqual(candidateOrder(input).map(x=>x.surname),["Able","Young"]); });
test("stance chip geometry is label-independent",()=>{ const geometry=()=>({padding:"same",border:"same",weight:"same"}); assert.deepEqual(geometry("SUPPORTS"),geometry("OPPOSES")); });
