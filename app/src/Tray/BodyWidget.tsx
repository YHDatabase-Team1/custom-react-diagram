import * as React from 'react';
import * as _ from 'lodash';
import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import styled from '@emotion/styled';
import { CanvasWidget } from '@projectstorm/react-diagrams';
import { WorkCanvasWidget } from '../WorkCanvasWidget';
import App from '../App';
import SelectNodeModel from '../components/node/SelectNode';
import OutputNodeModel from '../components/node/OutputNodeModel';
import FilterNode from '../components/node/FilterNode';
import MemoNodeModel from '../components/node/MemoNodeModel';
import { IconButton } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import saveAs from 'file-saver';
import EastIcon from '@mui/icons-material/East';
import StorageIcon from '@mui/icons-material/Storage';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { ProjectDiagramModel } from '../components/model/ProjectDiagramModel';
import axios from "axios";

export interface BodyWidgetProps {
	app: App;
}

namespace S {
	export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	`;

	export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 0 20px;
		align-items: center;
		justify-content: space-between;
	`;

	export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

	export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;

	export const Content2 = styled.div`
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	`

	export const Nav = styled.div`
		background: rgb(60, 60, 60);
	`

	export const ButtonBox = styled.div`
		display: flex;
		justify-content: flex-end;
		align-items: center;
	`
}

export class BodyWidget extends React.Component<BodyWidgetProps> {

	handlePlay = () => {
		console.log('play project')
		console.log(this.props.app.workflow);
	}

	handleSaveProject = () => {
		let project_json = this.props.app.getDiagramEngine().getModel().serialize();
		let projectModel = this.props.app.getDiagramEngine().getModel();
		let progMstValue: any;

		// prog_mst 추출
		Object.keys(projectModel).forEach((key) => {
			if (key in projectModel) {
				if (key === 'prog_mst') {
					progMstValue = (projectModel as any)[key];
				}
			}
		});

		progMstValue = {
			...progMstValue,
			viewAttr: JSON.stringify(project_json)
		};
		console.log(progMstValue);
		console.log(`/diagram/project/update/${progMstValue.progId}`);
		axios.post(`/diagram/project/update/${progMstValue.progId}`, progMstValue, { maxRedirects: 0})
			.then(response => {
				console.log(response.data);
			})
			.catch((Error) => {
				console.log(Error);
		});
	}

	handleUseChange = (e: any) => {
		const current_model = this.props.app.getActiveDiagram().setUseYn();
	}

	render() {
		return (
			<S.Body>
				<S.Content>
					<TrayWidget>
						<div>
							<TrayItemWidget model={{ type: 'select' }} name="Select Node" color="rgb(0,192,255)"><StorageIcon fontSize='large'/></TrayItemWidget>
							<TrayItemWidget model={{ type: 'filter' }} name="Filter Node" color="rgb(0,192,255)"><FilterAltIcon fontSize='large'/></TrayItemWidget>
							<TrayItemWidget model={{ type: 'output' }} name="Output Node" color="rgb(0,192,255)"><EastIcon fontSize='large'/></TrayItemWidget>
							<TrayItemWidget model={{ type: 'memo' }} name="Memo Node" color="rgb(0,192,255)"><NoteAltOutlinedIcon fontSize='large'/></TrayItemWidget>
						</div>
					</TrayWidget>
					<S.Content2>
						<S.Header>
						<div
						className="title"
						onDoubleClick={(event) => (event.target as HTMLDivElement).setAttribute("contentEditable", "true")}
						onBlur={(event) => (event.target as HTMLDivElement).removeAttribute("contentEditable")}
						// onKeyDown={(event) => (event.target as HTMLDivElement).blur()}
						>
						프로젝트명
						</div>
							<S.ButtonBox>
								<FormControlLabel control={<Checkbox/>} onChange={this.handleUseChange} label="사용" />
								<IconButton onClick={this.handlePlay}>
									<PlayCircleFilledWhiteOutlinedIcon fontSize='large' style={{color: 'white'}}/>
								</IconButton>
								<IconButton onClick={this.handleSaveProject}>
									<SaveOutlinedIcon fontSize='large'  style={{color: 'white'}}/>
								</IconButton>
								<IconButton>
										<FolderOpenIcon fontSize="large" style={{ color: 'white' }} />


								</IconButton>
							</S.ButtonBox>
						</S.Header>
						<S.Layer
							onDrop={(event) => {
								var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
								var nodesCount = _.keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

								var node: FilterNode | SelectNodeModel | OutputNodeModel | MemoNodeModel= null;

								if (data.type === 'select'){
									node = new SelectNodeModel(this.props.app.getDiagramEngine());
								} else if (data.type === 'output'){
									node = new OutputNodeModel(this.props.app.getDiagramEngine());
								} else if (data.type === 'filter'){
									node = new FilterNode(this.props.app.getDiagramEngine());
								} else if (data.type === 'memo') {
									node = new MemoNodeModel(this.props.app.getDiagramEngine());
								}
								var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
								node.setPosition(point);
								this.props.app.getDiagramEngine().getModel().addNode(node);
								this.forceUpdate();
								console.log('drag stopped')
							}}
							onDragOver={(event) => {
								event.preventDefault();
							}}
						>
							<WorkCanvasWidget>
								<CanvasWidget engine={this.props.app.getDiagramEngine()} />
							</WorkCanvasWidget>
						</S.Layer>
					</S.Content2>
				</S.Content>
			</S.Body>
		);
	}
}
