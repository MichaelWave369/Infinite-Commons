import React,{useEffect,useRef} from "react";
import {HERITAGE_ARCHIVE_V03 as archive} from "./heritageArchivePlan.mjs";

/**
 * Native modal with browser Escape handling and focus restoration.
 * Reads static, authored PUBLIC DESIGN METADATA only. Never accesses archives.
 */
export function HeritageArchiveDialog({onClose}){
  const ref=useRef(null);
  useEffect(()=>{
    const modal=ref.current;
    if(modal && !modal.open) modal.showModal();
    return ()=>{if(modal?.open) modal.close();};
  },[]);
  return <dialog ref={ref} className="third-light-archive-dialog" aria-labelledby="heritage-archive-title"
    onClose={onClose}>
    <header className="third-light-archive-header">
      <div>
        <p className="third-light-archive-kicker">PARALLAX INSTITUTE · CURATED DESIGN METADATA</p>
        <h2 id="heritage-archive-title">The Third Light · Heritage Archive</h2>
        <p>Three original architectural stories, preserved as separate campus landmarks.</p>
      </div>
      <button type="button" className="third-light-archive-close"
        onClick={()=>ref.current?.close()} aria-label="Close Heritage Archive">✕ Close</button>
    </header>
    <div className="third-light-archive-exhibits">
      {archive.records.map((record,index)=><article className="third-light-archive-exhibit" key={record.id}>
        <span className="third-light-archive-number">EXHIBIT 0{index+1}</span>
        <h3>{record.title}</h3>
        <p className="third-light-archive-credit">{record.credit}</p>
        <p>{record.summary}</p>
        <ul>{record.details.map(detail=><li key={detail}>{detail}</li>)}</ul>
      </article>)}
    </div>
    <footer className="third-light-archive-footer">
      <strong>Archive boundary:</strong> This public preview contains only already-documented design summaries.
      Original conversations, original blueprints and private memories have not been imported or published.
      Any future excerpts require explicit owner selection and review. This exhibit is not an AI reconstruction of Helion.
    </footer>
  </dialog>;
}

// React.lazy expects a default export from a dynamically imported module.
export default HeritageArchiveDialog;
