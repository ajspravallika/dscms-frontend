import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import ErrorBanner from "./ErrorBanner";
export default function DoubleConfirmModal({isOpen,onClose,title,itemName,onConfirm,warningText}){
  const [step,setStep]=useState(1); const [typed,setTyped]=useState(""); const [isDeleting,setIsDeleting]=useState(false); const [err,setErr]=useState("");
  const reset=()=>{setStep(1);setTyped("");setErr("");};
  const handleClose=()=>{reset();onClose();};
  const handleConfirm=async()=>{if(typed!==itemName){setErr("Type exactly: "+itemName);return;}setIsDeleting(true);try{await onConfirm();handleClose();}catch(e){setErr(e.response?.data?.message||"Could not complete.");}finally{setIsDeleting(false);}};
  return(<Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="max-w-md">{step===1?(<div className="space-y-4"><div className="rounded-md bg-warn-soft border border-warn/30 p-4"><p className="text-sm font-medium text-warn">⚠️ This cannot be undone</p><p className="text-sm text-warn/80 mt-1">{warningText}</p></div><div className="flex justify-end gap-3"><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="danger" onClick={()=>setStep(2)}>I understand, continue</Button></div></div>):(<div className="space-y-4"><p className="text-sm text-ink">Type <strong>{itemName}</strong> to confirm:</p><Input value={typed} onChange={e=>setTyped(e.target.value)} placeholder={itemName} />{err&&<ErrorBanner message={err} />}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={handleClose}>Cancel</Button><Button variant="danger" isLoading={isDeleting} onClick={handleConfirm}>Permanently delete</Button></div></div>)}</Modal>);
}