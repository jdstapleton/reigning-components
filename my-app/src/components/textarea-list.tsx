import React, {useState, SyntheticEvent} from 'react';
import classNames from 'classnames';
import {useDebouncedCallback} from "use-debounce";
import getLineHeight from 'line-height';

interface TextareaDescriptor {
    lineHeight: number;
}

interface TextareaListProps {
    maxRows?: number;
    presetValues?: string[];
    onCommit?: (committedItems: string[]) => void;
}

function showIfNonEmpty(container: string|any[]) {
    return { 'show': (container.length > 0) };
}

export function TextareaList(props: TextareaListProps) {
    const presetValueString = (props.presetValues || []).join('\n');
    const [pendingValueString, setPendingValueString] = useState(presetValueString);
    const [textareaDescriptor, setTextareaDescriptor] = useState<TextareaDescriptor>();

    const [debouncedResizer] = useDebouncedCallback(resizeTextArea, 200, { maxWait: 400 });

    function debouncedEventResizer(e: SyntheticEvent<HTMLTextAreaElement>) {
        debouncedResizer(e.currentTarget);
    }

    function fetchTextareaDescriptor(textarea: HTMLTextAreaElement) {
        let result = textareaDescriptor;
        if (!result) {
            result = calculateTextareaDescriptor(textarea);
            setTextareaDescriptor(result);
        }

        return result;
    }

    function resizeTextArea(ta: HTMLTextAreaElement) {
        const descriptor = fetchTextareaDescriptor(ta);
        ta.style.maxHeight = (props.maxRows && `${props.maxRows * descriptor.lineHeight}px`) || 'initial';
        ta.style.height = `${pendingValueString.split('\n').length * descriptor.lineHeight}px`;
    }

    function commitHandler() {
        const toCommit = pendingValueString.split('\n');
        if (props.onCommit) {
            props.onCommit(toCommit);
        }

        setPendingValueString('');
    }

    return <div className="textarea-list">
        <textarea
            value={pendingValueString}
            onKeyDown={debouncedEventResizer}
            onChange={e => { setPendingValueString(e.target.value); debouncedEventResizer(e); }}
        />
        <button className={classNames('commit-button', showIfNonEmpty(pendingValueString))}
                onClick={commitHandler}>Add</button>
    </div>
}

export function calculateTextareaDescriptor(textArea: HTMLTextAreaElement): TextareaDescriptor {
    return { lineHeight: getLineHeight(textArea) };
}